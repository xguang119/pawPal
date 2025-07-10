import { useState,useRef,useEffect } from "react";
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';


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
    const [username, setUsername] = useState('');//show the user name

    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
      };

    //Pull request data from Supabase
    useEffect(() => {
        const fetchPosts = async () => {

            const { data, error } = await supabase
                .from('requests')
                .select('*')
                .order('created_at', { ascending: false });
            //if error print error message else post
            if (error) {
                console.error('Fetch error:', error);
            } else {
                setPost(data);
            }
        };
        fetchPosts();
    }, []);
    //try to pull the user id
    useEffect(() => {
        const getUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setUsername(user.email);
          }
        };
        getUser();
      }, []);

    const submitTask=async(task)=>{
        task.preventDefault();
        //If the required information is not filled in, the user is reminded to fill it in
        if (!service||!description||!contact||!date||!time){
            setMessage('Please fill in the information')
            return
        }

        let imageUrl=null;

        //upload picture
        if (image) {
            const { data, error } = await supabase.storage
              .from('image')
              .upload(`public/${Date.now()}-${image.name}`, image);
        
            if (error) {
              console.error('Upload error:', error);
              setMessage('Image upload failed!');
              return;
            }

        //get picture public url
        const { data: urlData } = supabase
            .storage
            .from('image')
            .getPublicUrl(data.path);
        imageUrl = urlData.publicUrl;
        }

        //Insert a new record into the 'requests' table in Supabase
        const {error : insertError} = await supabase.from('requests').insert([{
            service,
            description,
            contact,
            contact_type: contactType,
            date,
            time,
            image_url: imageUrl, 
            status : 'pending',
            username: username 
        }]);
        //if error, print post fail
        if (insertError) {
            console.error('Insert error:', insertError);
            setMessage('Post failed!');
            return;
        }


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
    //Avoid duplication of code
    const refreshPosts = async () => {
        const { data, error } = await supabase
              .from('requests')
              .select('*')
              .order('created_at', { ascending: false });
        if (!error){
            setPost(data);
        }
    };
        
          

    const statusChange=async(index)=>{
        //the poster can decline the helper
        const targetPost = post[index];
        if (targetPost.username === username && targetPost.status === 'Accepted by helper') {
            const { error } = await supabase
              .from('requests')
              .update({ status: 'pending', helper: null })
              .eq('id', targetPost.id);
        
            if (error) {
              console.error('Status revert error:', error);
              setMessage('Failed to revert status');
            } else {
              setMessage('Helper canceled.');
              refreshPosts();
            }
            return;
        }
        //helper can cancle
        if (targetPost.helper === username && targetPost.status === 'Accepted by helper') {
            const { error } = await supabase
              .from('requests')
              .update({ status: 'pending', helper: null })
              .eq('id', targetPost.id);
        
            if (error) {
              console.error('Helper cancel error:', error);
              setMessage('Failed to cancel your acceptance');
            } else {
              setMessage('You have canceled your acceptance.');
              refreshPosts();
            }
            return;
        }
        //only can accpect when pending and the user is not the poster 
        if (targetPost.status === 'pending' && targetPost.username !== username) {
            const { error } = await supabase
              .from('requests')
              .update({ status: 'Accepted by helper', helper: username })
              .eq('id', targetPost.id);
        
            if (error) {
              console.error('Accept error:', error);
              setMessage('Failed to accept task');
            } else {
              setMessage('Task accepted!');
              refreshPosts();
            }
          }
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
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
                <button onClick={handleLogout}>Logout</button>
                </div>

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
                    {thepost.image_url &&(
                        <img
                        src={thepost.image_url}
                        alt="Unable to display the image"
                        style={{ width: '100%',  marginBottom: '8px' }}
                        />
                    )}

                    {/*task*/}
                    <p><strong>{thepost.service}</strong> · {thepost.date} {thepost.time}</p>
                    <p style={{ fontSize: '0.9em'}}>{thepost.description}</p>
                    {/*contact*/}
                    <p style={{ fontSize: '0.8em', color: '#666' }}>
                        Contact information ({thepost.contact_type}): {thepost.contact}
                    </p>


                    {/*status*/}
                    <p style={{ fontSize: '0.8em', color: '#444' }}>
                        status:{thepost.status === 'pending' ? 'Not accepted yet' : 'Accepted '}
                    </p>

                    {/*accept botton*/}
                    <button onClick={() => statusChange(index)}>
                        {thepost.status === 'Accepted by helper' ? 'Cancel' : 'Accept'}
                    </button>
                    {/*show the username*/}
                    <p style={{ fontSize: '0.8em', color: '#999' }}>
                        Posted by: {thepost.username || 'Unknown'}
                    </p>
                    {/*show helper*/}
                    {thepost.helper && (
                        <p style={{ fontSize: '0.8em', color: '#007700' }}>
                            Accepted by: {thepost.helper}
                        </p>
                    )}
                    </div>
            ))}

        </div>

    );
}

