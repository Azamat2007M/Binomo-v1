import React, { useEffect, useState, useCallback } from 'react';
import Nav from '../../../components/main/Nav/Nav';
import Footer from '../../../components/main/Footer/Footer';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  useGetByIdQuery,
  useGetUserQuery,
} from '../../../redux/features/users';
import './binomers.scss';
import Error from '../../out/Error/Error';

const Binomers = () => {
  const navigate = useNavigate();
  const API = 'https://binomo-backend-v1.onrender.com/';
  const [binomers, setBinomers] = useState([]);
  const [choiceLeaderP, setChoiceLeaderP] = useState(0);
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

  const handleFollow = async (targetUserId) => {
    if (loadingUserId) return;

    const exists = binomers.some(
      (item) =>
        String(item?.user_id) === String(currentUserId) &&
        String(item?.author_id) === String(targetUserId)
    );
    if (exists) return;

    setLoadingUserId(targetUserId);

    try {
      await axios.post(`${API}binomers`, {
        user_id: currentUserId,
        author_id: targetUserId,
      });

      const currentFollowersCount = binomers.filter(
        (item) => String(item?.author_id) === String(targetUserId)
      ).length;

      await axios.patch(`${API}users/${targetUserId}`, {
        followers: currentFollowersCount + 1,
      });

      await getBinomers();
      refetchUsers();
    } catch (err) {
      console.error('Error following user:', err);
    } finally {
      setLoadingUserId(null);
    }
  };

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

      const currentFollowersCount = binomers.filter(
        (item) => String(item?.author_id) === String(targetUserId)
      ).length;

      await axios.patch(`${API}users/${targetUserId}`, {
        followers: Math.max(0, currentFollowersCount - 1),
      });

      await getBinomers();
      refetchUsers();
    } catch (err) {
      console.error('Error unfollowing user:', err);
    } finally {
      setLoadingUserId(null);
    }
  };

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
          <h1>Binomo for everyone</h1>
          <p>
            Learn more about Binomo's top traders. Get information, learn their{' '}
            <br />
            strategies and improve your trading results.
          </p>
        </div>

        <div className="choice-panel">
          <button
            onClick={() => setChoiceLeaderP(0)}
            className={choiceLeaderP === 0 ? 'b-active' : ''}
          >
            Binomer
          </button>
          <button
            onClick={() => setChoiceLeaderP(1)}
            className={choiceLeaderP === 1 ? 'b-active' : ''}
          >
            Leaderboard
          </button>
        </div>

        {choiceLeaderP === 1 ? (
          <div className="r-card">
            <h1>Top players</h1>
            {[...buser]
              .sort((a, b) => (b.wallet || 0) - (a.wallet || 0))
              .slice(0, 20)
              .map((el) => (
                <Link to={`/user/${el?.id}`} className="r-line" key={el?.id}>
                  <img src={el?.image || '/default-avatar.png'} alt={el?.name} />
                  <b>{el?.name}</b>
                  <p>{Math.round(el?.wallet || 0)}$</p>
                </Link>
              ))}
          </div>
        ) : (
          <div className="b-card">
            {buser.slice(0, 50).map((el) => {
              const isSelf = String(el?.id) === String(currentUserId);

              const isSubscribed = binomers.some(
                (item) =>
                  String(item?.user_id) === String(currentUserId) &&
                  String(item?.author_id) === String(el?.id)
              );

              const followersCount = binomers.filter(
                (item) => String(item?.author_id) === String(el?.id)
              ).length;

              const isItemLoading = loadingUserId === el?.id;

              return (
                <div className="b-line" key={el?.id}>
                  <div className="bl-top">
                    <img src={el?.image || '/default-avatar.png'} alt={el?.name} />
                    <div className="bl-info">
                      <b>{el?.name}</b>
                      <p>Followers: {followersCount}</p>
                    </div>
                  </div>

                  <p>Balance: {Math.round(el?.wallet || 0)}$</p>

                  <div className="b-buttons">
                    {isSelf ? (
                      <button disabled className="b-followed">
                        You
                      </button>
                    ) : isSubscribed ? (
                      <button
                        onClick={() => handleUnfollow(el?.id)}
                        disabled={isItemLoading}
                        className="b-followed"
                      >
                        {isItemLoading ? '...' : 'Followed'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollow(el?.id)}
                        disabled={isItemLoading}
                        className="b-follow"
                      >
                        {isItemLoading ? '...' : 'Follow'}
                      </button>
                    )
                    }

                    <Link to={`/user/${el?.id}`} className="b-view">
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Binomers;