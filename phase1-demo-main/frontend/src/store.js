import { configureStore } from '@reduxjs/toolkit'

import { setupListeners } from '@reduxjs/toolkit/query'
import { LoginRegisterApi } from './services/LoginRegisterApi'

export const store = configureStore({
  reducer: {
    
    [LoginRegisterApi.reducerPath]: LoginRegisterApi.reducer,
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(LoginRegisterApi.middleware),
})


setupListeners(store.dispatch)