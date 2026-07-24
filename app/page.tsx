import GuestCounter from "@/components/guestCounter";
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import AuthGuard from "@/components/authGuard";

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: todos } = await supabase.from('todos').select()
  
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fa",
      }}
    >
      <AuthGuard>
        <GuestCounter />
          <ul>
            {todos?.map((todo) => (
              <li key={todo.id}>{todo.name}</li>
            ))}
          </ul>
      </AuthGuard>
    </main>
  );
}

