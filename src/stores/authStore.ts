import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User {
  username: string
  role: 'admin' | 'user'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  // Mock user data
  const mockUsers: User[] = [
    { username: 'admin', role: 'admin' },
    { username: 'user', role: 'user' },
  ]

  function login(username: string, password: string): boolean {
    const foundUser = mockUsers.find((u) => u.username === username)
    if (foundUser && password === 'password') {
      // Mock password check
      user.value = foundUser
      isAuthenticated.value = true
      return true
    }
    return false
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
  }

  return { user, isAuthenticated, login, logout }
})
