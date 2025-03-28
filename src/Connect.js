import React, { useEffect, useState,useRef, useContext } from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {  toast } from 'react-toastify';
import { HiOutlinePhotograph } from "react-icons/hi";
import './Connect.scss'
import { MdPhotoCamera } from "react-icons/md";
import axios from 'axios';
import { url } from './services/UserService';
import { UserContext } from './usercontext';
function Connect({ show , handleClose }) {          
  const { idObjectConnect, setidObjectConnect } = useContext(UserContext);  
  const [fileName, setFileName] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [ObjectConnect, setObjectConnect] = useState({id:''})   
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading    
  const [listAllDevices, setlistAllDevices] = useState([]) 
  const [isClickButtonConnect, setisClickButtonConnect] = useState(false) 

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
  };

  const [image, setImage] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const startPosition = useRef({ x: 0, y: 0 });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (event) => {
    isDragging.current = true;
    startPosition.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
  };

  const handleMouseMove = (event) => {
    if (!isDragging.current) return;
    const newX = event.clientX - startPosition.current.x;
    const newY = event.clientY - startPosition.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const CallAPIGetObjectById = async () => {      
    let success = false;  
    while (!success) {
      try {
        
        const response = await axios.get(`${url}/GPSObject/GetObjectById?id=${idObjectConnect}`);       
        const LoggerData = response.data;
  
        // Kiểm tra nếu dữ liệu nhận được hợp lệ
        if (LoggerData) {
          
          setObjectConnect(LoggerData)

          success = true; // Dừng vòng lặp khi dữ liệu hợp lệ và được xử lý
          
        } else {
          
          alert('ReLoad');
        }
      } catch (error) {
        console.error('CallAPIGetObjectById, retrying...', error);    
        await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 2 giây trước khi thử lại
      }
    }
  };

  const callAPIConnecDevice = async () => {   
    try {

      const phoneNumer = sessionStorage.getItem('phoneNumer');
      const response = await axios.patch(`${url}/GPSObject/SetupDeviceForObject` , {
        phoneNumber: phoneNumer,  
        deviceId: selectedDevice,  
        objectId: idObjectConnect   
      });
      console.log(response)  
         
      if(response.data === 'Setup successfully!'){
              // toast.success('Kết nối với thiết bị thành công')
              // handleClose()   
              CallAPIGetObjectById()
              

              
      }
      else{
        toast.error('Kết nối thiết bị không thành công')
      }
       
    } catch (error) {
      toast.error('Đăng kí không thành công')
    }


  };



     const handleConnectObjectWithDevice = () => {
            callAPIConnecDevice()
            setisClickButtonConnect(true)

      }
  
      const callAPIgetAllDevices = async () => {     
        let success = false;   
        while (!success) {
          try {
            const response = await axios.get(`${url}/GPSDevice/GetAllGPSDevices`);  
            const LoggerData = response.data;
      
            // Kiểm tra nếu dữ liệu nhận được hợp lệ
            if (LoggerData && LoggerData.length > 0) {
    
              const phoneNumer = sessionStorage.getItem('phoneNumer');
              const listDevice = LoggerData.filter((item) => item.customerPhoneNumber === phoneNumer);
              setlistAllDevices(listDevice);      
              success = true; 
            } else {
    
            }
          } catch (error) {
            console.error('getAllDevices error, retrying...', error);  
            await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 2 giây trước khi thử lại
          }
        }
      };

      

      useEffect(() => {
        
        if(isClickButtonConnect){                                
          if(ObjectConnect.connected){
              toast.success('Kết nối với thiết bị thành công')
              setObjectConnect({id:''})
              setisClickButtonConnect(false)
              handleClose() 
          }   
          else{
            toast.error('Thiết bị đã được kết nối trước đó')
            setisClickButtonConnect(false)
          }                
          
        }    
          
      },[ObjectConnect])
      
      
      useEffect(() => {
        if(show){                                
          CallAPIGetObjectById()      
        }    
      },[show]) 

      useEffect(() => {
        callAPIgetAllDevices()  
      },[])  

      const handleDeviceChange = (event) => {
            setSelectedDevice(event.target.value); // Cập nhật thiết bị đã chọn
      };

     

   
    
console.log('ObjectConnect', ObjectConnect)     
      
  return (   
    <div  className="modal show"
      style={{ display: 'block', position: 'initial', zIndex:1000 }}>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>   
          <Modal.Title>{`Kết nối đối tượng ${ObjectConnect.name}`}</Modal.Title>
        </Modal.Header>   
        <Modal.Body>
        <form>
            {/* <div className="form-group">
             <div className='SettingFirst'>
                                                        <div className="Wrapimage">
                                                        <div
                                                            className="image-container"
                                                            onMouseMove={handleMouseMove}
                                                            onMouseUp={handleMouseUp}
                                                            onMouseLeave={handleMouseUp}
                                                          >
                                                            {image && (
                                                              <img
                                                                src={image}
                                                                alt="Uploaded"
                                                                style={{
                                                                  transform: `translate(${position.x}px, ${position.y}px)`,
                                                                }}
                                                                onMouseDown={handleMouseDown}
                                                              />
                                                            )}
                                      
                                                            
                                                          </div>
                                                          <div
                                                              className='buttonUpload'
                                                              onClick={() => document.getElementById("fileInput").click()}
                                                            >
                                                              <MdPhotoCamera className='IconButtonUpload'/>
                                                            </div>   
                                                        </div>
                                                          
                                                          <input
                                                            type="file"
                                                            id="fileInput"
                                                            style={{ display: "none" }}
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                          />
                                      
                                                          
                                                          
                                                      </div>
            </div> */}

            <div className="form-group">
              <label for="exampleInputJob">Chọn thiết bị kết nối</label>
              <select class="form-select" aria-label="Default select example"
                    onChange={handleDeviceChange} // Gọi hàm khi người dùng thay đổi lựa chọn
              >
                <option selected></option>

                {listAllDevices.map((item , index) => (    
                      <option value={item.id}>{item.name}</option>
                ))}

              </select>
            </div>

           
            
        </form>
        </Modal.Body>   
        <Modal.Footer>  
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
          <Button variant="primary" 
                onClick={handleConnectObjectWithDevice}
          >
            Kết nối
          </Button>
        </Modal.Footer>
      </Modal>
    
    </div>
  )
}

  
export default Connect        
