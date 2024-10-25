import { Fragment, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import axios from 'axios';
import '../App.css'


function CardMessage({message,paramsUrl}){

  const colorClasses = ["emerald-400",
  "yellow-400"]

  let colorTextWriter;
  let margin;
  let bkgColor;

  if(parseInt(paramsUrl.idPerson)===message.userResponseDto.idUser){
    colorTextWriter = colorClasses[0]
    margin = "margin-right"
    bkgColor = "green-cht-basic"
  }else{
    colorTextWriter = colorClasses[1]
  }

  return(
    <div className='wrapper-message'>
        <div className={`message ${margin} ${bkgColor}`}>
            <div className='info-writer'>
              <p className={`text-writer ${colorTextWriter}`}>~ {message.userResponseDto.name}</p>
            </div>
            <div className='box-content-text-message'>
              <p>{message.message}</p>
            </div>
        </div>
    </div>
   
  )
}

function IterateCardMessage({chat,paramsUrl}){
  if(Object.keys(chat).length === 0 || chat["commentResponseDto"].length === 0){
    return
  }

  return(
    <Fragment>
      {
        chat.commentResponseDto.map(message=> <CardMessage
          key={message.id}
          paramsUrl={paramsUrl}
          message={message}
        />)
      }
    </Fragment>
  )
}

function BarSendMessage({params,sendMessage}){

  const textCampusRef = useRef()

  const launchMessage = ()=>{
    sendMessage({
      message: textCampusRef.current.value,
      idUser: params.idPerson
    }
    )
  }

  return(
    <div className='box-send-message box-send-message-1'>
        <input ref={textCampusRef} type="text" />
        <button onClick={()=> launchMessage()}>Enviar</button>
    </div>
    
  )
}

export function App() {
  const paramsUrl = useParams()
  const url = 'http://192.168.1.16:8080/chat-socket'
  const [stompClient,setStompClient] = useState(null)
  const [chat,setChat] = useState({})
  const init = useRef(false)
  const [sockJs,setSockJs] = useState(new SockJS(url))
  
  const initMessages = async ()=>{
    if(init.current==false){
      try{
        const response = await axios.post(`http://192.168.1.16:8080/chat/list/${paramsUrl.roomId}`)
        setChat(response.data)
        console.log(response.data);
        init.current = true
      }catch(e){
        console.log("Error",e);
      }
    }
   
  }

  useEffect(()=>{
    initMessages()
    const client = Stomp.over(sockJs);
    
    // Creamos la conexión al broker con la room
    client.connect({},()=>{
      client.subscribe(`/topic/${paramsUrl.roomId}`,(objMessage)=>{
        const newMessageObj = JSON.parse(objMessage.body)
        setChat((prevObjMessage)=>{
          let instanceBefore = structuredClone(prevObjMessage)
          instanceBefore.commentResponseDto.push(newMessageObj)
          return instanceBefore
        })
      })
    }, (error)=>{
        console.log("Error Web Socket");
    })

    setStompClient(client)

    return () => {
      if (stompClient) {
          stompClient.disconnect(() => {
              console.log('Desconectado del WebSocket');
          });
      }
    }
  },[])


  const sendMessage = (messageObj)=>{
    if(stompClient.connect){
      stompClient.send(`/app/chat/${paramsUrl.roomId}`,{},JSON.stringify(messageObj))
    }
  }

  return (
    <Fragment>
     <main className='main'>
     <section className='section'>
        <div className='panel panel-1'>
          <div className='chat chat-1'>
              <IterateCardMessage
                paramsUrl={paramsUrl}
                chat={chat}
              />
          </div>
         <BarSendMessage
            params={paramsUrl}
            sendMessage={sendMessage}
          />
        </div>
      </section>
     </main>
    </Fragment>    
  )
}
