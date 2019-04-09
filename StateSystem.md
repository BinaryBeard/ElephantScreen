# ElephantScreen State System

Each ElephantScreen will have a state (JSON) associated with it. This state changes upon an event being performed.

### Initial State

```json
{
	"imageID": 0,
	"activateIR": false,
	"ledState": 0,
	"feederDuration": 0
}
```

|key|type|description|
|---|---|---|
|**imageID**|Integer|0 = Blank image, >0 = Any uniquely stored image|
|**activateIR**|Boolean|If set to true, the system will actively send messages to the cloud of the current reading|
|**ledState**|Integer|0 = off, 1 = R, 2 = G, 3 = B|
|**feederDuration**|Integer|0 = off, >0 = Time in seconds the feed will be "on"|


## Example States

### Before Setup Event (Initial State)

**ElephantScreen 1**

```json
{
	"imageID": 0,
	"activateIR": false,
	"ledState": 0,
	"feederDuration": 0
}
```

**ElephantScreen 2**

```json
{
	"imageID": 0,
	"activateIR": false,
	"ledState": 0,
	"feederDuration": 0
}
```

**ElephantScreen 3**

```json
{
	"imageID": 0,
	"activateIR": false,
	"ledState": 0,
	"feederDuration": 0
}
```

### After Setup Event

**ElephantScreen 1**

```json
{
	"imageID": 101,
	"activateIR": false,
	"ledState": 0,
	"feederDuration": 0
}
```

**ElephantScreen 2**

```json
{
	"imageID": 2987,
	"activateIR": false,
	"ledState": 0,
	"feederDuration": 0
}
```

**ElephantScreen 3**

```json
{
	"imageID": 936,
	"activateIR": false,
	"ledState": 0,
	"feederDuration": 0
}
```

### After Start Event

**ElephantScreen 1**

```json
{
	"imageID": 101,
	"activateIR": true,
	"ledState": 2,
	"feederDuration": 0
}
```

**ElephantScreen 2**

```json
{
	"imageID": 2987,
	"activateIR": true,
	"ledState": 2,
	"feederDuration": 0
}
```

**ElephantScreen 3**

```json
{
	"imageID": 936,
	"activateIR": true,
	"ledState": 2,
	"feederDuration": 0
}
```

### After Answer Event (2 was Selected)

**ElephantScreen 1**

```json
{
	"imageID": 101,
	"activateIR": false,
	"ledState": 0,
	"feederDuration": 0
}
```

**ElephantScreen 2**

```json
{
	"imageID": 2987,
	"activateIR": false,
	"ledState": 1,
	"feederDuration": 5
}
```

**ElephantScreen 3**

```json
{
	"imageID": 936,
	"activateIR": false,
	"ledState": 0,
	"feederDuration": 0
}
```

### After Answer Resolves (Pseudo-Setup Event)

**NOTE:** This event and the previous one will iterate indefinitely until the *Stop Event*.

**ElephantScreen 1**

```json
{
	"imageID": 936,
	"activateIR": false,
	"ledState": 0,
	"feederDuration": 0
}
```

**ElephantScreen 2**

```json
{
	"imageID": 101,
	"activateIR": false,
	"ledState": 0,
	"feederDuration": 0
}
```

**ElephantScreen 3**

```json
{
	"imageID": 2987,
	"activateIR": false,
	"ledState": 0,
	"feederDuration": 0
}
```

### After Stop

**ElephantScreen 1**

```json
{
	"imageID": 0,
	"activateIR": false,
	"ledState": 0,
	"feederDuration": 0
}
```

**ElephantScreen 2**

```json
{
	"imageID": 0,
	"activateIR": false,
	"ledState": 0,
	"feederDuration": 0
}
```

**ElephantScreen 3**

```json
{
	"imageID": 0,
	"activateIR": false,
	"ledState": 0,
	"feederDuration": 0
}
```
