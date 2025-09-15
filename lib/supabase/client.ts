interface MockSupabaseClient {
  auth: {
    signUp: (credentials: { email: string; password: string; options?: any }) => Promise<{ data: any; error: any }>
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{ data: any; error: any }>
    signOut: () => Promise<{ error: any }>
    getUser: () => Promise<{ data: { user: any }; error: any }>
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      data: { subscription: { unsubscribe: () => void } }
    }
  }
  from: (table: string) => {
    select: (columns?: string) => Promise<{ data: any[]; error: any }>
    insert: (data: any) => Promise<{ data: any; error: any }>
    update: (data: any) => { eq: (column: string, value: any) => Promise<{ data: any; error: any }> }
    delete: () => { eq: (column: string, value: any) => Promise<{ data: any; error: any }> }
  }
}

// Mock data storage
const mockUsers: any[] = []
const mockServices: any[] = []
const mockBookings: any[] = []
let currentUser: any = null

export function createClient(): MockSupabaseClient {
  return {
    auth: {
      signUp: async ({ email, password, options }) => {
        const user = { id: Date.now().toString(), email, created_at: new Date().toISOString() }
        mockUsers.push(user)
        currentUser = user
        return { data: { user }, error: null }
      },
      signInWithPassword: async ({ email, password }) => {
        const user = mockUsers.find((u) => u.email === email)
        if (user) {
          currentUser = user
          return { data: { user }, error: null }
        }
        return { data: null, error: { message: "Invalid credentials" } }
      },
      signOut: async () => {
        currentUser = null
        return { error: null }
      },
      getUser: async () => {
        return { data: { user: currentUser }, error: null }
      },
      onAuthStateChange: (callback) => {
        // Mock auth state change
        setTimeout(() => callback("SIGNED_IN", currentUser), 100)
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
    },
    from: (table: string) => ({
      select: async (columns = "*") => {
        let data: any[] = []
        switch (table) {
          case "services":
            data = mockServices
            break
          case "bookings":
            data = mockBookings
            break
          case "users":
            data = mockUsers
            break
        }
        return { data, error: null }
      },
      insert: async (newData) => {
        const record = { ...newData, id: Date.now().toString(), created_at: new Date().toISOString() }
        switch (table) {
          case "services":
            mockServices.push(record)
            break
          case "bookings":
            mockBookings.push(record)
            break
        }
        return { data: record, error: null }
      },
      update: (updateData) => ({
        eq: async (column: string, value: any) => {
          let targetArray: any[] = []
          switch (table) {
            case "services":
              targetArray = mockServices
              break
            case "bookings":
              targetArray = mockBookings
              break
          }
          const index = targetArray.findIndex((item) => item[column] === value)
          if (index !== -1) {
            targetArray[index] = { ...targetArray[index], ...updateData }
            return { data: targetArray[index], error: null }
          }
          return { data: null, error: { message: "Record not found" } }
        },
      }),
      delete: () => ({
        eq: async (column: string, value: any) => {
          let targetArray: any[] = []
          switch (table) {
            case "services":
              targetArray = mockServices
              break
            case "bookings":
              targetArray = mockBookings
              break
          }
          const index = targetArray.findIndex((item) => item[column] === value)
          if (index !== -1) {
            const deleted = targetArray.splice(index, 1)[0]
            return { data: deleted, error: null }
          }
          return { data: null, error: { message: "Record not found" } }
        },
      }),
    }),
  }
}
