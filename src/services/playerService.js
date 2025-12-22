import { endpoints } from '../store/urls'
import { api } from './api'

export const playerService = {
  registerPlayer: async (registrationData) => {
    try {
      const response = await api.post(endpoints.playerRegister, registrationData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
} 