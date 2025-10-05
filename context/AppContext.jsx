"use client";
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs"; // 👈 import from Clerk
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();
  const { getToken } = useAuth();

  const { user, isSignedIn } = useUser(); // 👈 now we have `user`
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(false);  // null 
  const [isSeller, setIsSeller] = useState(false);

  const [cartItems, setCartItems] = useState({});

  const fetchProductData = async () => {
    setProducts(productsDummyData); 
  };
  
  const fetchUserData = async () => {
    try {
      if (user && user.publicMetadata.role === "seller") {
        setIsSeller(true);
      }
      const token = await getToken();
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUserData(data.user);
        console.log(data.user);
        setCartItems(data.user.cartItems);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = (cartData[itemId] || 0) + 1;
    setCartItems(cartData);
  };

  const updateCartQuantity = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    if (quantity === 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
  };

  const getCartCount = () => {
    return Object.values(cartItems).reduce((a, b) => a + b, 0);
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const id in cartItems) {
      let itemInfo = products.find((product) => product._id === id);
      if (itemInfo) {
        totalAmount += itemInfo.offerPrice * cartItems[id];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchProductData();
      
    }
  }, [isSignedIn, user]);

  useEffect(()=>{
    if (user) {
        fetchUserData();
      }
  }, [user]);
  
  const value = {
    user,
    getToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
