import axios from 'axios'
import https from 'https'

//open watcher request
const openWatcher = () => {
  const streamUpdates=()=> {
    axios(`http://127.0.0.1:8001/apis/apps/v1/watch/deployments/`)
      .then((response) => {
        return response.data
      })
      .then((res:any) =>
        res.on('readable', () => {
          let chunk = res.read()
          const utf8Decoder = new TextDecoder('utf-8')
          let buffer = ''

          //previous function

          buffer += utf8Decoder.decode(chunk)
          const remainingBuffer = findLine(buffer, (line:any) => {
            try {
              const event = JSON.parse(line)             
              //call handle data function
              handleData(event)
            } catch (error) {
              console.log('Error while parsing', chunk, '\n', error)
            }
          })

          buffer = remainingBuffer
        })
      )
      .catch((error) => {
        console.log('Error! Retrying in 5 seconds...', error)
        setTimeout(() => streamUpdates(), 5000)
      })

    const findLine:any=(buffer:any, fn:any) =>{
      const newLineIndex = buffer.indexOf('\n')
      // if the buffer doesn't contain a new line, do nothing
      if (newLineIndex === -1) {
        return buffer
      }
      const chunk = buffer.slice(0, buffer.indexOf('\n'))
      const newBuffer = buffer.slice(buffer.indexOf('\n') + 1)

      // found a new line! execute the callback
      fn(chunk)

      // there could be more lines, checking again
      return findLine(newBuffer, fn)
    }
  }

  streamUpdates()
}


type TempDeploymentType={
  kind:string,
  handleType:string,
  uid: string,
  replicas: string,
  deploymentName: string,
  siteNamespace: string,
}

//store data for each deployment to track the change
let tempDeployments:TempDeploymentType[] = []

//handle event and types
const handleData = (data:any) => {
  //if namepsace is default or kube-system, do not run
  if (data.object.metadata.namespace === 'kube-system' || data.object.metadata.namespace == 'default') {
    return;
  }


  //for added action type
  const handleAdded = () => {

  }

  //for modified action type
  const handleModified = () => {
    console.log('Data: ', data)
    //find index of matched deployment in tempDeployments array
    let deploymentIndex = tempDeployments.findIndex(dep => dep.uid == data.object.metadata.uid)

    if (deploymentIndex >= 0) {

      //check if the replica has changed
      if (tempDeployments[deploymentIndex].replicas !== data.object.spec.replicas) {
        //if replicas are not same as previous, it has changed

        //update array object
        tempDeployments[deploymentIndex].replicas = data.object.spec.replicas

        //post data to back-end
        postDataToWonsta(tempDeployments[deploymentIndex])


      } else {
        //when replicas from previous or current are same, do nothing
        return;
      }



      //post data to wonsta backend
    } else {
      //add this deployment to tempDeployment for tracking changes
      let tempDeployment = {
        kind:data.object.kind,
        handleType:'',
        uid: data.object.metadata.uid,
        replicas: data.object.status.replicas,
        deploymentName: data.object.metadata.name,
        siteNamespace: data.object.metadata.namespace,
      }
      tempDeployments.push(tempDeployment)
      //post data to wonsta backend
      postDataToWonsta(tempDeployment)
    }
  }

  //for deleted action type
  const handleDeleted = () => {}

  //switch case for event types
  switch (data.type) {
    case 'ADDED': {
      //handle for added type //FOR NOW all in modified
      handleModified()
      break
    }
    case 'MODIFIED': {
      handleModified()
      break
    }
    case 'DELETED': {
      handleModified()
      break
    }
    default:
      break
  }


}

//post data to Wonsta backend
const postDataToWonsta = (data:any) => {
  const api = process.env.BACKEND_API_URL || 'https://api.wonsta.io/api/general/monitor'
  //axios header
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  })

  axios.defaults.httpsAgent = httpsAgent
  const headers:any = {
    generaltoken: process.env.BACKEND_TOKEN_GENERAL ||'',
    monitortoken: process.env.BACKEND_TOKEN_MONITOR || '',
    auth: process.env.BACKEND_AUTH || '',
    'Content-Type': 'application/json',
  }
  axios.defaults.headers = headers

  

  axios.post(api, data)
    .then((res) => console.log('tempData posted to wonsta monitor api:', res.data))
    .catch((error) => console.log('error in posting to monitor', error))
}

openWatcher()