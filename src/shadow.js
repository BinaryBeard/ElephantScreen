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
                testID: '',
                imageID: 0,
                activateIR: false,
                ledState: 0,
                feederDuration: 0,
                screens: [],
            },
        },
    })
}

function setReportedKey(key, value) {
    const reportedState = { state: { reported: {} } }
    reportedState.state.reported[key] = value
    addToUpdateQueue(reportedState)
}

function nullifyDesired() {
    addToUpdateQueue({ state: { desired: null } })
}

function updateImageState(newState) {
    const imgLoc = `images/${newState}.png`
    const windows = BrowserWindow.getAllWindows()
    windows[0].webContents.executeJavaScript(`document.getElementById('main_image').src = '${imgLoc}'`, () => {
        setReportedKey('imageID', newState)
    })
}

function updateTestIDState(newState) {
    setReportedKey('testID', newState)
}

function updateIRState(newState) {
    const irState = newState ? 'Yes' : 'No'
    const windows = BrowserWindow.getAllWindows()
    windows[0].webContents.executeJavaScript(`document.getElementById('ir_state').innerHTML = 'Reading IR Data: ${irState}'`, () => {
        setReportedKey('activateIR', newState)
    })
}

function updateLEDState(newState) {
    let colorHex = '000000'
    switch (newState) {
        case 1:
            colorHex = 'FF0000'
            break
        case 2:
            colorHex = '00FF00'
            break
        case 3:
            colorHex = '0000FF'
            break
        default:
            colorHex = '000000'
    }
    const windows = BrowserWindow.getAllWindows()
    windows[0].webContents.executeJavaScript(`document.getElementById('led_state').style.backgroundColor = '#${colorHex}'`, () => {
        setReportedKey('ledState', newState)
    })
}

function updateFeederState(newState) {
    const feederState = newState > 0 ? 'On' : 'Off'
    const windows = BrowserWindow.getAllWindows()
    windows[0].webContents.executeJavaScript(`document.getElementById('feeder_state').innerHTML = 'Feeder: ${feederState}'`, () => {
        setReportedKey('feederDuration', newState)
    })

    if (feederState === ' On') {
        setTimeout(() => {
            updateFeederState(0)
        }, newState * 1000)
    }
}

function updateScreensState(newState) {
    setReportedKey('screens', newState)
}

shadow.on('connect', () => {
    console.log('Connected to Shadow')
    shadow.register(ShadowName, {}, () => {
        setInitialState()
    })
})

shadow.on('delta', (name, delta) => {
    console.log('Received Delta')
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
            case 'testID':
                updateTestIDState(delta.state[key])
                break
            case 'screens':
                updateScreensState(delta.state[key])
                break
            default:
                // console.log('Nothing was done, but desired should be gone...')
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
