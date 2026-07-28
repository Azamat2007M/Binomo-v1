import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../../../components/main/Footer/Footer';
import Nav from '../../../components/main/Nav/Nav';
import Error from '../../../pages/out/Error/Error';
import './user.scss';
import { jwtDecode } from 'jwt-decode';
import { useGetByIdQuery } from '../../../redux/features/users';

const User = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = 'https://binomo-backend-v1.onrender.com/';

  const [binomers, setBinomers] = useState([]);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const token = localStorage.getItem('Access');
  const decoded = token ? jwtDecode(token) : {};
  const currentUserId = decoded?.userId;

  const { 
    data: buser, 
    isLoading: isUserLoading, 
    error: userError, 
    refetch: refetchBuser 
  } = useGetByIdQuery(id, { skip: !id });

  const { data: currentUser } = useGetByIdQuery(currentUserId, { 
    skip: !currentUserId 
  });

  const fetchBinomers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}binomers`);
      setBinomers(res.data || []);
    } catch (err) {
      console.error('Error fetching binomers:', err);
    }
  }, [API]);

  useEffect(() => {
    fetchBinomers();
  }, [fetchBinomers]);

  useEffect(() => {
    if (currentUser && currentUser.useractived === false) {
      navigate('/ban');
    }
  }, [currentUser, navigate]);

  const userFollowersCount = binomers.filter(
    (item) => String(item?.author_id) === String(id)
  ).length;

  const existingSubscription = binomers.find(
    (item) =>
      String(item?.user_id) === String(currentUserId) &&
      String(item?.author_id) === String(id)
  );

  const isSelf = String(id) === String(currentUserId);

  const handleFollow = async () => {
    if (isActionLoading || existingSubscription) return;
    setIsActionLoading(true);

    try {
      await axios.post(`${API}binomers`, {
        user_id: currentUserId,
        author_id: id,
      });

      const updatedFollowersCount = userFollowersCount + 1;

      await axios.patch(`${API}users/${id}`, {
        followers: updatedFollowersCount,
      });

      await fetchBinomers();
      refetchBuser();
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (isActionLoading || !existingSubscription) return;
    setIsActionLoading(true);

    try {
      await axios.delete(`${API}binomers/${existingSubscription.id}`);

      const updatedFollowersCount = Math.max(0, userFollowersCount - 1);

      await axios.patch(`${API}users/${id}`, {
        followers: updatedFollowersCount,
      });

      await fetchBinomers();
      refetchBuser();
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getLevelName = (level) => {
    switch (level) {
      case 1: return 'Bronze';
      case 2: return 'Silver';
      case 3: return 'Platina';
      case 4: return 'Legendary';
      default: return level >= 5 ? 'KokSultan' : 'Bronze';
    }
  };

  if (isUserLoading) {
    return (
      <div className="main-loading">
        <img src="/Loading.svg" alt="Loading..." />
      </div>
    );
  }

  if (userError) return <Error />;

  return (
    <>
      <Nav />
      <section className="u-wrapper-f">
        <div className="case">
          <div className="u-wrapper">
            <div className="u-card">
              <div className="p-image">
                <div className={`p-image${Math.min(buser?.level || 1, 5)}`}>
                  <img src={buser?.image || '/default-avatar.png'} alt="User avatar" />
                </div>
              </div>

              <div className="u-line">
                <h2>Name:</h2>
                <h3>{buser?.name || 'N/A'}</h3>
              </div>

              <div className="u-line">
                <h2>Followers:</h2>
                <h3>{userFollowersCount}</h3>
              </div>

              <div className="u-line">
                <h2>Balance:</h2>
                <h3>{Math.round(buser?.wallet || 0)}$</h3>
              </div>

              <div className="u-line">
                <h2>Level:</h2>
                <h2 className="p-act">{getLevelName(buser?.level)}</h2>
              </div>

              {isSelf ? (
                <button disabled className="b-followed">
                  You
                </button>
              ) : existingSubscription ? (
                <button
                  onClick={handleUnfollow}
                  disabled={isActionLoading}
                  className="b-followed"
                >
                  {isActionLoading ? 'Unfollowing...' : 'Followed'}
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={isActionLoading}
                  className="b-follow"
                >
                  {isActionLoading ? 'Following...' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default User;