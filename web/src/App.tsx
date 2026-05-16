import { ContactForm } from '@/features/contact'
import {UserList} from "@/features/users";

function App() {
  return (
      <div>
        <h1>Reference Architecture</h1>
        <UserList />
        <ContactForm />
      </div>
  )
}

export default App