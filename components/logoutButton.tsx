"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from '../styles/logoutButton.module.css'

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
    className={styles.logoutButton} 
    onClick={logout} >
      Logout
    </button>
  );
}