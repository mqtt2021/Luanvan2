import React,{useState, useEffect, useContext} from 'react'
import { RiGpsFill } from "react-icons/ri";
import { TiBatteryCharge } from "react-icons/ti";
import './Notification.scss'
import { GiPositionMarker } from "react-icons/gi";
import { FaBell } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { IoMdAddCircle } from "react-icons/io";
import {Link, useNavigate} from "react-router-dom";   
import ModalAddDevice from './settingDevice/AddDevice';
import { MdDirectionsRun } from "react-icons/md";
import { FaCircle } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";
import { FaConnectdevelop } from "react-icons/fa";
import { FiWifi } from "react-icons/fi";
import { FiWifiOff } from "react-icons/fi";   
import { MdBrowserUpdated } from "react-icons/md";     
import { PiBatteryWarningFill } from "react-icons/pi";
import axios from 'axios';
import { url } from './services/UserService';
import { UserContext } from './usercontext';                 
import { GrUpdate } from "react-icons/gr";
import * as signalR from "@microsoft/signalr";
import { MdError } from "react-icons/md";
function Notification() { 


const { unreadCount, setUnreadCount  } =  useContext(UserContext);    

  const [connection, setConnection] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Thêm state để quản lý trạng thái loading
  const [listNotifications, setListNotifications] = useState([]);
  const [phone, setPhone] = useState('');
  const [showModalAddDevice, setshowModalAddDevice] = useState(false);

  const [listAllDeices, setListAllDeices] = useState([]);   

  const handleshowModalAddDevice = ()=> {   
        setshowModalAddDevice(true)       
  }
  const handleCloseModalAddDeice = ()=>{
        setshowModalAddDevice(false)     
  } 

  const getNotification = async () => {
    setIsLoading(true); // Bắt đầu loading
    let success = false;  
    while (!success) {   
      try {
        const response = await axios.get(`${url}/Notification/GetNotificationByPhoneNumber?phoneNumber=${phone}`);   
        const NotificationsData = response.data;
  
        // Kiểm tra nếu dữ liệu nhận được hợp lệ
        if (NotificationsData) {    
          // const ListStolen = LoggerData.filter((item) => item.stolenLines.length > 0);
          const sortedData = NotificationsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

          
          const uniqueNotifications = sortedData.reduce((acc, item) => {
            const exists = acc.find((t) => t.title === item.title && t.timestamp === item.timestamp);
            if (!exists) {
              acc.push(item); // Chỉ thêm vào danh sách nếu chưa có
            }
          return acc;
          }, []);

          const unreadCount = uniqueNotifications.filter((item) => item.isAcknowledge === false).length;
          setUnreadCount(unreadCount)

          setListNotifications(uniqueNotifications);    
          
          success = true; // Dừng vòng lặp khi dữ liệu hợp lệ và được xử lý
        } else {
          alert('ReLoad');
        }
      } catch (error) {
        //console.error('getNotification error, retrying...', error);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 2 giây trước khi thử lại
      }
    }
    
  };

  const UpdateAcknowledge = async (title, description, timestamp, isAcknowledge) => {   

    if(!isAcknowledge){
      let success = false;
      while (!success) {
        try {
          const response = await axios.patch(`${url}/Notification/UpdateNotification`, {
            "customerPhoneNumber": phone,
            "title": title,                     
            "timestamp": timestamp 
          });  
          const LoggerData = response.data;
    
          // Kiểm tra nếu dữ liệu nhận được hợp lệ            
          if (LoggerData && LoggerData.length > 0) {
            success = true; 
            // Gọi lại hàm getNotification sau khi cập nhật thành công
            await getNotification();
          }
        } catch (error) {
          console.error('getAllDevices error, retrying...', error);  
          await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 1 giây trước khi thử lại
        }
      }
    }
    
  };
  


  const getAllDevices = async () => {   
    setIsLoading(true); // Bắt đầu loading
    let success = false;
    while (!success) {
      try {
        const response = await axios.get(`${url}/GPSDevice/GetAllGPSDevices`);  
        const LoggerData = response.data;
  
        // Kiểm tra nếu dữ liệu nhận được hợp lệ
        if (LoggerData && LoggerData.length > 0) {

          const phoneNumer = sessionStorage.getItem('phoneNumer');
          const listDevice = LoggerData.filter((item) => item.customerPhoneNumber === phoneNumer);
          setListAllDeices(listDevice);
          success = true; 
        } else {

        }
      } catch (error) {
        console.error('getAllDevices error, retrying...', error);  
        await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 2 giây trước khi thử lại
      }
    }
    setIsLoading(false); // Bắt đầu loading
  };


  const postDataToAPI = async (url, data) => {
    try {
      const response = await axios.post(`${url}/Notification/GetNotificationByPhoneNumber?phoneNumber=${phone}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      //console.log('Response:', response.data);
      return response.data; // Trả về dữ liệu từ server nếu cần dùng tiếp
    } catch (error) {
      console.error('POST request failed:', error);
      return null; // Trả về null nếu lỗi
    }
  };

  useEffect(() => {  
    const phoneNumer = sessionStorage.getItem('phoneNumer');    
    setPhone(phoneNumer)    
  }, [])
  
  useEffect(() => { 
    if(phone !== ''){
      getNotification();
      getAllDevices()
    }                     
  }, [phone])


  useEffect(() => { 
    if(listNotifications.length > 0){
      setIsLoading(false); // Kết thúc loading sau khi lấy dữ liệu xong
    }                     
  }, [listNotifications])

  // useEffect(() => {    
  //   if(connection !== null){     
  //     getAllDevices(connection)   
  //   }                     
  // }, [connection])

  function convertDateTimeBefore(inputString) {
    const [date, time] = inputString.split('T');    
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year} ${time}`;    
  }

  const iconMap = {
    "Pin yếu": <PiBatteryWarningFill className='iconDevice' />,
    "Cảnh báo chuyển động": <MdDirectionsRun className='iconDevice' />,
    "Vùng an toàn": <IoIosWarning className='iconDevice' />, // Thêm icon khác
    "Cập nhật vị trí": <GrUpdate className='iconDevice' />, // Thêm icon khác
  }


  useEffect( () => {
    let connection = new signalR.HubConnectionBuilder()   
        .withUrl("https://mygps.runasp.net/NotificationHub")   
        .withAutomaticReconnect()    
        .build();     
    // Bắt đầu kết nối   
    connection.start()   
        .then(() => {  
          console.log("✅ Kết nối SignalR thành công!");
                     // Lắng nghe các sự kiện cho từng thiết bị
        listAllDeices.forEach(device => {
          connection.on(`SendNotification${device.id}`, data => {
            const obj = JSON.parse(data);
            console.log(`📡 Dữ liệu từ thiết bị ${device.id}:`, obj);
             // Đợi 2 giây trước khi gọi getNotification
            setTimeout(() => {
              getNotification();
            }, 4000);
          });
        });
         
          
        })
        .catch(err => {
            console.error('Kết nối thất bại: ', err);
        });
    // Lắng nghe sự kiện kết nối lại
    connection.onreconnected(connectionId => {
        console.log(`Kết nối lại thành công. Connection ID: ${connectionId}`);
    });
    // Lắng nghe sự kiện đang kết nối lại
    connection.onreconnecting(error => {
        console.warn('Kết nối đang được thử lại...', error);
    });
    // Cleanup khi component unmount hoặc khi listAllDeices thay đổi
    return () => {
      connection.stop();
      console.log("🔴 Kết nối SignalR đã đóng!");
    };
  }, [listAllDeices] )



  // const uniqueNotifications = listNotifications.reduce((acc, item) => {
  //     const exists = acc.find((t) => t.title === item.title && t.timestamp === item.timestamp);
  //     if (!exists) {
  //       acc.push(item); // Chỉ thêm vào danh sách nếu chưa có
  //     }
  // return acc;
  // }, []);


  // useEffect(() => {
  //   // Khởi tạo kết nối SignalR
  //   let conn = new signalR.HubConnectionBuilder()  
  //       .withUrl("https://mygps.runasp.net/NotificationHub")     
  //       .withAutomaticReconnect()
  //       .build();
  //   conn.start()
  //       .then(() => {
  //           //console.log(" Kết nối SignalR thành công!");
  //           setConnection(conn); // Lưu connection vào state
  //           getAllDevices(conn); // Gọi API sau khi kết nối thành công
  //       })
  //       .catch(err => console.error(" Kết nối thất bại: ", err));
  //   return () => {
  //       conn.stop(); // Dọn dẹp kết nối khi component bị unmount
  //   };
  // }, []);


  return (
    <div className='fatherNotification'>
      <div className='wrapperNotification'>
      
            <div className='TitleNotification'>
                    <div className='TitleNotificationItem'>
                          Thông báo
                    </div> 
            </div>

            {
              isLoading ? (
                    <div className="loadingContainer">
                            <div className="spinner"></div> {/* Hiển thị hiệu ứng loading */}
                            <p>Đang tải thông báo...</p>                              
                    </div>
              ) :
              
              (listNotifications.map((item , index) => (  
              <div
                  className='wrapperContainerNotification'
                  onClick={() => UpdateAcknowledge(item.title, item.description, item.timestamp, item.isAcknowledge)}
 
              >        
                <div className='containerDevice'>
                  <div className='itemDevice itemDeviceFirst'>
                      <div className='divIconDevice'>    
                              {iconMap[item.title] || <MdError className='iconDevice' />}                      
                      </div>    
                      <div className='divIconNameAndPin'>
                          <div className='name'>
                            {item.title}  
                          </div>
                          <div className='divIconPin'>  
                            <div>{item.description}</div>   
                          </div>
                      </div>
                  </div>
                  <div className='itemDevice itemNotificationecond'>
                          <div className = 'itemNotificationecondItem'>  
                              {convertDateTimeBefore(item.timestamp)}
                          </div>
                          {item.isAcknowledge ?
                          
                            <div className = 'itemNotificationecondItem' style={{ fontStyle: "italic" }}>                            
                                    Đã xem
                            </div>  

                            :

                            <div className = 'itemNotificationecondItem'>                            
                              <FaCircle className='iconAcknownledge' />
                            </div>
                          
                           }
                                       
                  </div>

                </div>
              </div>                              
              ))  )}
      </div>   
              
    </div>
  )
}

export default Notification
