import { useState,useRef } from "react";


export default function PostForm(){
    const [service , setService]= useState('');//service type
    const [description , setDescription]= useState('');//task description
    const [contact, setContact]=useState('');//contact info
    const [contactType, setContactType]=useState('');//contact info type
    const [date, setDate]=useState('');//date
    const [time,setTime]=useState('');//time(hour,minute)
    const [image, setImage]=useState(null); //can choose to post a image
    const [post, setPost]=useState([]);//the list of every posts
    const [message, setMessage]=useState('');//message to tell the user if successfully post

    const fileInputRef = useRef(null);


    const submitTask=(task)=>{
        task.preventDefault();
        //If the required information is not filled in, the user is reminded to fill it in
        if (!service||!description||!contact||!date||!time){
            setMessage('Please fill in the information')
            return
        }
    

    const newPost={
        service,
        description,
        contact,
        date,
        time,
        imageUrl: image ? URL.createObjectURL(image) : null,
        createAt: new Date().toLocaleString(),
        status : 'pending',
    };
    console.log('NewTask', newPost);

    //post in order
    setPost([newPost,...post]);
    //reset after submit
    setService('');
    setDescription('');
    setContact('');
    setDate('');
    setTime('');
    setImage(null);
    setContactType('');
    setMessage('Successfully Post!');

    if (fileInputRef.current) {
        fileInputRef.current.value = null;
    }
      
    };

    const statusChange=(index)=>{
        setPost((prevP) => {
            const update=[...prevP];
            update[index].status='Accepted by helper';
            return update
        });
    };

    return (
        <div style={{
            maxWidth : '650px', 
            margin:'40px auto',
            }}>
            <h2 style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '24px'}}>
                Post the Request~
            </h2>

            <form onSubmit={submitTask}>
                {/*What kind of service*/}
                <div style={{ marginBottom: '12px' }}>
                <label>Service Type: </label>
                <select value={service} onChange={(task)=>setService(task.target.value)}required>
                    <option value="">(Please select)</option>
                    <option value="Dog walking">Dog walking</option>
                    <option value="Vaccinations">Vaccinations</option>
                    <option value="Grooming">Grooming</option>
                    <option value="Daycare">Daycare</option>        
                </select>
                </div>
                
                {/*Describe the task*/}
                <div style={{ marginBottom: '12px' }}>
                <label>Description: </label>
                <textarea
                placeholder="Describe your task..."
                value={description}
                onChange={(task)=>setDescription(task.target.value)}
                rows={1}
                required
                />
                </div>

                {/*How to contact? emial or phone number*/}
                <div style={{ marginBottom: '12px' }}>
                <label>How would you like us to contact you ?:</label>
                <select value={contactType} onChange={(task)=>setContactType(task.target.value)}required>
                <option value="">(Please select)</option>
                <option value="email">email</option>
                <option value="phone call">phone call</option>
                </select>
                </div>

                {/*contact info*/}
                <div style={{ marginBottom: '12px' }}>
                <label>Please enter your contact Information: </label>
                <textarea
                placeholder="..."
                value={contact}
                onChange={(task)=>setContact(task.target.value)}
                rows={1}
                required
                />
                </div>

                {/*Date*/}
                <div style={{ marginBottom: '12px' }}>
                <label>Service Date: </label>
                <textarea
                placeholder="ex:Jan 1"
                value={date}
                onChange={(task)=>setDate(task.target.value)}
                rows={1}
                required
                />
                </div>

                {/*Time*/}
                <div style={{ marginBottom: '12px' }}>
                <label>Service Time: </label>
                <textarea
                placeholder="ex:10 am to 3 pm"
                value={time}
                onChange={(task)=>setTime(task.target.value)}
                rows={1}
                required
                />
                </div>

                {/*Photo?*/}
                <div style={{ marginBottom: '12px' }}>
                <label>Upload Photo(optional): </label>
                <input
                type="file"
                accept="image/*"
                onChange={(task)=>setImage(task.target.files[0])}
                ref={fileInputRef}
                />
                </div>

                {/*Submit botton*/}
                <button type="submit">Post</button>
            </form>
            {message && <p>{message}</p>}

            <h3>Recent Requests</h3>
            {post.map((thepost,index)=>(
                <div key={index} style={{
                    border: '1px solid #ccc',
                    padding: '12px',
                    marginBottom: '12px',
                    position: 'relative'
                }}>
                    {/*Picture*/}
                    {thepost.imageUrl &&(
                        <img
                        src={thepost.imageUrl}
                        alt="Unable to display the image"
                        style={{ width: '100%',  marginBottom: '8px' }}
                        />
                    )}

                    {/*task*/}
                    <p><strong>{thepost.service}</strong> · {thepost.date} {thepost.time}</p>
                    <p style={{ fontSize: '0.9em'}}>{thepost.description}</p>
                    <p style={{ fontSize: '0.8em', color: '#666' }}> {thepost.contact}</p>

                    {/*status*/}
                    <p style={{ fontSize: '0.8em', color: '#444' }}>
                        status:{thepost.status === 'pending' ? 'Not accepted yet' : 'Accepted '}
                    </p>

                    {/*accept botton*/}
                    {thepost.status === 'pending' && (
                        <button onClick={() => statusChange(index)}>Accpect</button>
                    )}

                    </div>
            ))}

        </div>

    );
}

