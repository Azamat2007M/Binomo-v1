import { useState, useEffect, useRef } from "react";
import { HiMenuAlt1 } from "react-icons/hi";
import { IoEnterOutline, IoClose } from "react-icons/io5";
import { FaInstagram, FaTelegramPlane } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import "./nav.scss";
import { Link, useNavigate } from "react-router-dom";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import { Toaster } from "react-hot-toast";
import { RxAvatar } from "react-icons/rx";
import { jwtDecode } from "jwt-decode";
import { useGetByIdQuery } from "../../../redux/features/users";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Error from "../../../pages/out/Error/Error";

const Nav = () => {
  const [sections, setSections] = useState({
    forTraders: false,
    information: false,
  });
  const [isOpen, setIsOpen] = useState(false);
  const previousTradesRef = useRef([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("Access");
  const decoded = token ? jwtDecode(token) : {};

  const { data: user, isLoading, error } = useGetByIdQuery(decoded?.userId, {
    skip: !decoded?.userId,
    pollingInterval: 5000,
  });

  const toggleSection = (name) => {
    setSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleDrawer = () => setIsOpen((prev) => !prev);
  const closeDrawer = () => setIsOpen(false);

  useEffect(() => {
    if (!decoded?.userId) return;

    const monitorTrades = async () => {
      try {
        const res = await axios.get('https://binomo-transactions-v1.onrender.com/transactions');
        const allTrades = res.data || [];
        
        const currentTrades = allTrades.filter(
          (trade) => String(trade.userId) === String(decoded.userId)
        );

        const prevTrades = previousTradesRef.current;

        if (prevTrades.length > 0) {
          prevTrades.forEach((oldTrade) => {
            const updatedTrade = currentTrades.find(
              (t) => String(t.id) === String(oldTrade.id)
            );

            if (oldTrade.status === "open" && updatedTrade && updatedTrade.status === "closed") {
              const profitText = updatedTrade.profit >= 0 
                ? `+$${updatedTrade.profit.toFixed(2)}` 
                : `-$${Math.abs(updatedTrade.profit).toFixed(2)}`;

              toast.success(`Trade ${updatedTrade.coin} closed! Profit: ${profitText}`, {
                autoClose: 3000,
                style: {
                  background: "#1e7e34",
                  color: "white",
                },
              });
            }
          });
        }

        previousTradesRef.current = currentTrades;
      } catch (err) {
        console.error("Error fetching transactions for toast:", err);
      }
    };

    monitorTrades();

    const tradeInterval = setInterval(monitorTrades, 3000);
    return () => clearInterval(tradeInterval);
  }, [decoded?.userId]);

  useEffect(() => {
    if (user && user?.useractived === false) {
      navigate("/ban");
    }
  }, [user, navigate]);

  if (isLoading) return <div className='main-loading'><img src="/Loading.svg" alt="" /></div>;
  if (error) return <Error />;

  return (
    <>
      <ToastContainer position="top-right" />
      <nav>
        <Toaster toastOptions={{ className: "r-toast" }} />
        <div className="case">
          <div className="navbar">
            <div className="n-left">
              {!isOpen ? (
                <HiMenuAlt1 onClick={toggleDrawer} className="burger" />
              ) : (
                <IoClose className="exit" onClick={closeDrawer} />
              )}
              <Drawer
                open={isOpen}
                direction="left"
                className="n-menu"
                onClose={closeDrawer}
                enableOverlay={false}
                size="30%"
              >
                <div className="n-line">
                  <h1><Link to="/">Home</Link></h1>
                </div>
                <div className="n-line">
                  <div
                    className="active-top"
                    onClick={() => toggleSection("forTraders")}
                  >
                    <h1>For traders</h1>
                    {!sections.forTraders ? <IoIosArrowDown /> : <IoIosArrowUp />}
                  </div>
                  <div className={sections.forTraders ? "active" : "default"}>
                    <h1>Tournaments</h1>
                    <h1>Promotions</h1>
                    <h1>Strategies</h1>
                  </div>
                </div>
                <div className="n-line">
                  <div
                    className="active-top"
                    onClick={() => toggleSection("information")}
                  >
                    <h1>Information</h1>
                    {!sections.information ? <IoIosArrowDown /> : <IoIosArrowUp />}
                  </div>
                  <div className={sections.information ? "active" : "default"}>
                    <h1>Statuses</h1>
                    <h1>About US</h1>
                    <h1>Regulations</h1>
                    <h1>Client Agreement</h1>
                    <h1>AML policy</h1>
                  </div>
                </div>
                <div className="n-line">
                  <h1>Help Center</h1>
                </div>
                <div className="n-line">
                  <Link to={"/binomers"}>
                    <h1>Binomers</h1>
                  </Link>
                </div>
                <a href="https://t.me/binomoplatform">
                  <button className="b-telegram">
                    <p>Binomo on Telegram</p> <FaTelegramPlane className="n-icon" />
                  </button>
                </a>
                <a href="https://www.instagram.com/binomo/">
                  <button className="b-instagram">
                    <p>Binomo on Instagram</p> <FaInstagram className="n-icon" />
                  </button>
                </a>
              </Drawer>
              <Link to={"/"} className="b-logo">
                  <img src="/Logo3.png" alt=""/>
                  <h1 className="bi-logo">binomo</h1>
              </Link>
            </div>
            <div className="n-right">
              {!localStorage.getItem("Access") ? (
                <Link to="/login">
                  <div className="logs">
                    <button>
                      <IoEnterOutline className="enter" />
                      <h1> Sign up</h1>
                    </button>
                  </div>
                </Link>
              ) : (
                <div className="twice">
                  <Link to={"/profile"}>
                    {!user?.image ? (
                      <RxAvatar className="a-twice"/>
                    ) : (
                      <div className={`p-image${Math.min(user?.level || 1, 5)} p-image`}>
                        <img src={user?.image} alt="" />
                      </div>
                    )}
                  </Link>
                  <div className="w-line">
                    <b>{Math.round(user?.wallet) || 0} $</b>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Nav;