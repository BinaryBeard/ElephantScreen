import IoT from 'aws-iot-device-sdk'
import { BrowserWindow } from 'electron'

const IoTHost = 'a2638bvz51i7pu-ats.iot.us-east-1.amazonaws.com'
const ShadowName = 'ElephantScreen1'

const shadow = IoT.thingShadow({
    host: IoTHost,
    clientId: ShadowName,
    protocol: 'wss',
    profile: 'ElephantScreen',
})

const pendingUpdateQueue = []
const processingUpdateQueue = {}
let queueRunning = false
function processNextUpdateInQueue() {
    console.log('Processing update in queue')
    queueRunning = true
    if (pendingUpdateQueue.length > 0) {
        const token = shadow.update(ShadowName, pendingUpdateQueue[0])
        if (token !== null) {
            processingUpdateQueue[token] = pendingUpdateQueue[0]
            pendingUpdateQueue.shift()
        }
    }

    if (pendingUpdateQueue.length > 0) {
        setTimeout(() => {
            processNextUpdateInQueue()
        }, 250)
    }
    else {
        queueRunning = false
    }
}

function addToUpdateQueue(state) {
    console.log('Adding update to queue')
    pendingUpdateQueue.push(state)
    if (!queueRunning) {
        processNextUpdateInQueue()
    }
}

function acceptToken(token) {
    console.log(`Accepting ${token}`)
    delete processingUpdateQueue[token]
}

function rejectToken(token) {
    console.log(`Rejecting ${token}`)
    addToUpdateQueue(processingUpdateQueue[token])
    delete processingUpdateQueue[token]
}

function processTokenStatus(status, token) {
    console.log(`${token} has status of ${status}`)
    switch (status) {
        case 'accepted':
            acceptToken(token)
            break
        default:
            rejectToken(token)
    }
}

function setInitialState() {
    addToUpdateQueue({
        state: {
            reported: {
                imageID: 0,
                activateIR: false,
                ledState: 0,
                feederDuration: 0,
            },
        },
    })
}

function setReportedKey(key, value) {
    console.log(`Setting reported state of ${key} to ${value}`)
    const reportedState = { state: { reported: {} } }
    reportedState.state.reported[key] = value
    console.log(reportedState)
    addToUpdateQueue(reportedState)
}

function nullifyDesired() {
    console.log('Deleting Desired State')
    addToUpdateQueue({ state: { desired: null } })
}

function updateImageState(newState) {
    const imgLoc = `images/${newState}.png`
    const windows = BrowserWindow.getAllWindows()
    windows[0].webContents.executeJavaScript(`document.getElementById('main_image').src = '${imgLoc}'`, () => {
        setReportedKey('imageID', newState)
    })
}

function updateIRState(newState) {
    setReportedKey('activateIR', newState)
}

function updateLEDState(newState) {
    setReportedKey('ledState', newState)
}

function updateFeederState(newState) {
    setReportedKey('feederDuration', newState)
}

shadow.on('connect', () => {
    console.log('Connected to Shadow')
    shadow.register(ShadowName, {}, () => {
        console.log('Setting Shadow to Initial State')
        setInitialState()
    })
})

shadow.on('delta', (name, delta) => {
    console.log('Received Delta')
    console.log(JSON.stringify(delta.state, null, 4))

    Object.keys(delta.state).forEach((key) => {
        switch (key) {
            case 'imageID':
                updateImageState(delta.state[key])
                break
            case 'activateIR':
                updateIRState(delta.state[key])
                break
            case 'ledState':
                updateLEDState(delta.state[key])
                break
            case 'feederDuration':
                updateFeederState(delta.state[key])
                break
            default:
                console.log('Nothing was done, but desired should be gone...')
        }
    })
    nullifyDesired()
})

shadow.on('status', (name, stat, token) => {
    processTokenStatus(stat, token)
})

shadow.on('timeout', (name, token) => {
    console.log(`Received timeout on ${token}`)
})
