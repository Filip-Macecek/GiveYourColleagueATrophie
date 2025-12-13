import axios, { AxiosInstance } from 'axios'

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

/**
 * API client for Trophy3D backend.
 */
class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  // Session endpoints
  /**
   * Creates a new session.
   */
  async createSession(organizerName?: string) {
    const response = await this.client.post('/sessions', {
      organizerName: organizerName || undefined
    })
    return response.data
  }

  /**
   * Retrieves session details with trophies.
   */
  async getSession(sessionCode: string) {
    const response = await this.client.get(`/sessions/${sessionCode}`)
    return response.data
  }

  /**
   * Starts presentation mode for a session.
   */
  async startPresentation(sessionCode: string) {
    const response = await this.client.post(`/sessions/${sessionCode}/present`)
    return response.data
  }

  /**
   * Closes a session.
   */
  async closeSession(sessionCode: string) {
    const response = await this.client.post(`/sessions/${sessionCode}/close`)
    return response.data
  }

  // Trophy endpoints
  /**
   * Submits a new trophy.
   */
  async submitTrophy(
    sessionCode: string,
    recipientName: string,
    achievementText: string,
    submitterName?: string
  ) {
    const response = await this.client.post(
      `/sessions/${sessionCode}/trophies`,
      {
        recipientName,
        achievementText,
        submitterName: submitterName || undefined
      }
    )
    return response.data
  }

  /**
   * Retrieves all trophies for a session.
   */
  async listTrophies(sessionCode: string) {
    const response = await this.client.get(`/sessions/${sessionCode}/trophies`)
    return response.data
  }

  /**
   * Retrieves a single trophy with details.
   */
  async getTrophy(sessionCode: string, trophyId: string) {
    const response = await this.client.get(
      `/sessions/${sessionCode}/trophies/${trophyId}`
    )
    return response.data
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
