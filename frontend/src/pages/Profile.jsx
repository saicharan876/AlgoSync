import { useEffect, useState } from 'react';
import './ProfilePage.css'
import { useParams } from 'react-router-dom';
 
const Profile =  () => {

  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFn = async () => {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/users/${userId}`);
      const data = await response.json();
      setUserData(data);
      setLoading(false);
    };

    fetchFn();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (!userData) return <p>No user data found</p>;

  console.log(userData);

  return (
    <div className='profile'>
        <h1 className='head'>Profile</h1>

        <img src='/avatar.png' alt='usericon' className='left'/>
        <div className='icon'> 
          <div className='right'>
            <span>{userData.username}</span>
            <span>{userData.email}</span>
          </div>
        </div>
        <div className='box'>

          <div className='element'>
            <div className='l'>
              <img src='/institute.jpg' alt='country' style={{height:"24px",width:"24px"}}/>
              <span>
                Institute
              </span> 
            </div>
            <span className='r'>
              {userData.institute}
            </span>
          </div>

          <div className='element'>
            <div className='l'>
              <img src='/city.png' alt='country' style={{height:"24px",width:"24px"}}/>
              <span>
                City
              </span> 
            </div>
            <span className='r'>
              {userData.city}
            </span>
          </div>

          <div className='element'>
            <div className='l'>
              <img src='/country.png' alt='country' style={{height:"24px",width:"24px"}}/>
              <span>
                Country
              </span> 
            </div>
            <span className='r'>
              {userData.country}
            </span>
          </div>

          <div className='element'>
            <div className='l'>
              <img src='/bio.png' alt='bio' style={{height:"24px", width:"24px"}}/>
              <span>
                Bio
              </span> 
            </div>
            <span className='r'>
              {userData.bio}
            </span>
          </div>

          <div className='element'>
            <div className='l'>
             <img src='/git.png' alt='git'/>
              <span>
                Github
              </span> 
            </div>
            <span className='r'>
              {userData.github}
            </span>
          </div>

          <div className='element' style={{borderBottom:"none"}}>
            <div className='l'>
              <img src='/codeforces.png' alt='codeforces'/>
              <span>
                Codeforces
              </span> 
            </div>
            <span className='r'>
              {userData.codeforces}
            </span>
          </div>

        </div>
    </div>
  )
}

export default Profile