import React, { useEffect, useState, useCallback } from 'react';
import Nav from '../../../components/main/Nav/Nav';
import Footer from '../../../components/main/Footer/Footer';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  useGetUserQuery,
  useGetByIdQuery,
} from '../../../redux/features/users';
import './followers.scss';
import emptyImg from '../../../assets/b-empty.png';
import Error from '../../out/Error/Error';

const Followers = () => {
  const [choiceBinomers, setChoiceBinomers] = useState(0);
  const navigate = useNavigate();
  const API = 'https://binomo-backend-v1.onrender.com/';
  const [binomers, setBinomers] = useState([]);
  const [loadingUserId, setLoadingUserId] = useState(null);
  const token = localStorage.getItem('Access');
  const decoded = token ? jwtDecode(token) : {};
  const currentUserId = decoded?.userId;

  const {
    data: buser = [],
    isLoading,
    error,
    refetch: refetchUsers,
  } = useGetUserQuery();

  const { data: currentUser } = useGetByIdQuery(currentUserId, {
    skip: !currentUserId,
  });

  const getBinomers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}binomers`);
      setBinomers(res.data || []);
    } catch (err) {
      console.error('Error fetching binomers:', err);
    }
  }, [API]);

  useEffect(() => {
    getBinomers();
  }, [getBinomers]);

  useEffect(() => {
    if (currentUser && currentUser.useractived === false) {
      navigate('/ban');
    }
  }, [currentUser, navigate]);

  const handleUnfollow = async (targetUserId) => {
    if (loadingUserId) return;

    const existingSub = binomers.find(
      (item) =>
        String(item?.user_id) === String(currentUserId) &&
        String(item?.author_id) === String(targetUserId)
    );

    if (!existingSub) return;

    setLoadingUserId(targetUserId);

    try {
      await axios.delete(`${API}binomers/${existingSub.id}`);
      await getBinomers();
      refetchUsers();
    } catch (err) {
      console.error('Error unfollowing user:', err);
    } finally {
      setLoadingUserId(null);
    }
  };

  const myFollowersEntries = binomers.filter(
    (item) => String(item?.author_id) === String(currentUserId)
  );

  const myFollowingEntries = binomers.filter(
    (item) => String(item?.user_id) === String(currentUserId)
  );

  if (isLoading) {
    return (
      <div className="main-loading">
        <img src="/Loading.svg" alt="Loading..." />
      </div>
    );
  }

  if (error) return <Error />;

  return (
    <>
      <Nav />
      <div className="r-wrapper">
        <div className="r-top">
          <h1>Followers</h1>
          <p>
            Learn more about Binomo's top traders. Get information, learn their{' '}
            <br />
            strategies and improve your trading results.
          </p>
        </div>

        <div className="choicer-panel">
          <button
            onClick={() => setChoiceBinomers(0)}
            className={choiceBinomers === 0 ? 'b-active' : ''}
          >
            Followers
          </button>
          <button
            onClick={() => setChoiceBinomers(1)}
            className={choiceBinomers === 1 ? 'b-active' : ''}
          >
            Following
          </button>
        </div>

        {choiceBinomers === 1 ? (
          <div className="r-card">
            <h1>Followed Channels</h1>
            {myFollowingEntries.length > 0 ? (
              myFollowingEntries.map((sub) => {
                const targetUser = buser.find(
                  (u) => String(u?.id) === String(sub?.author_id)
                );

                if (!targetUser) return null;

                const isItemLoading = loadingUserId === targetUser.id;

                return (
                  <div className="r-line" key={sub?.id}>
                    <Link
                      to={`/user/${targetUser.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        textDecoration: 'none',
                        color: 'inherit',
                        flex: 1,
                      }}
                    >
                      <img
                        src={targetUser.image || '/default-avatar.png'}
                        alt={targetUser.name}
                      />
                      <b>{targetUser.name}</b>
                    </Link>
                    <p>{Math.round(targetUser.wallet || 0)}$</p>
                  </div>
                );
              })
            ) : (
              <div className="b-empty">
                <img src={emptyImg} alt="Empty" />
              </div>
            )}
          </div>
        ) : (
          <div className="fc-wrapper">
            {myFollowersEntries.length > 0 ? (
              <div className="fl-card">
                {myFollowersEntries.map((sub) => {
                  const followerUser = buser.find(
                    (u) => String(u?.id) === String(sub?.user_id)
                  );

                  if (!followerUser) return null;

                  const followerUserFollowersCount = binomers.filter(
                    (item) => String(item?.author_id) === String(followerUser.id)
                  ).length;

                  return (
                    <div className="f-line" key={sub?.id}>
                      <div className="some">
                        <div className="fl-top">
                          <img
                            src={followerUser.image || '/default-avatar.png'}
                            alt={followerUser.name}
                          />
                          <div className="fl-info">
                            <b>{followerUser.name}</b>
                            <p>Followers: {followerUserFollowersCount}</p>
                          </div>
                        </div>
                        <p>Balance: {Math.round(followerUser.wallet || 0)}$</p>
                        <div className="f-buttons">
                          <Link
                            to={`/user/${followerUser.id}`}
                            style={{ width: '100%' }}
                            className="b-view"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="b-empty"
                style={{ width: '90%', margin: 'auto' }}
              >
                <img src={emptyImg} alt="Empty" />
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Followers;