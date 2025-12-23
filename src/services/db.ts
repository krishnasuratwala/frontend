
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatMessage } from './gemini';

export interface User {
  id: string;
  username: string;
  coins: number;
  subscription: 'free' | 'infantry' | 'commander';
  role?: 'user' | 'admin';
  affiliate_balance: number;
  referrals_count: number;
  paid_referrals_count: number;
}

export interface StoredSession {
  id: string;
  userId: string;
  title: string;
  timestamp: string;
  leaderId: string;
  style: string;
  messages: ChatMessage[];
}

// API Config
const API_BASE = import.meta.env.VITE_API_URL || "https://dictator-ai-middleware-2.onrender.com";

export const db = {
  // --- AUTHENTICATION ---
  async signup(username: string, accessCode: string): Promise<User> {
    const refCode = localStorage.getItem('dictator_ref');
    const response = await fetch(`${API_BASE}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: accessCode, referral_code: refCode })
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Non-JSON response:", text.slice(0, 100)); // Log for debug
      throw new Error(`Server Error (Invalid JSON): ${text.slice(0, 50)}...`);
    }

    if (!response.ok) {
      throw new Error(data.error || "Signup Failed");
    }
    localStorage.setItem('dictator_user_id', data.id);
    localStorage.setItem('dictator_token', data.token); // Store Token
    return data;
  },

  async login(username: string, accessCode: string, loginType: 'user' | 'admin' = 'user'): Promise<User> {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: accessCode, login_type: loginType })
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Non-JSON response:", text.slice(0, 100));
      throw new Error(`Server Error (Invalid JSON): ${text.slice(0, 50)}...`);
    }

    if (!response.ok) {
      throw new Error(data.error || "Login Failed");
    }
    localStorage.setItem('dictator_user_id', data.id);
    localStorage.setItem('dictator_token', data.token); // Store Token
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('dictator_token');
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE}/api/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error("Failed to restore session", e);
    }
    return null;
  },

  // --- DATA ---
  async getSessions(userId: string): Promise<StoredSession[]> {
    const token = localStorage.getItem('dictator_token');
    if (!token) return [];

    const response = await fetch(`${API_BASE}/api/sessions?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) return [];
    return await response.json();
  },

  async saveSession(session: StoredSession): Promise<void> {
    const token = localStorage.getItem('dictator_token');
    await fetch(`${API_BASE}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(session)
    });
  },

  async deleteSession(sessionId: string): Promise<void> {
    const token = localStorage.getItem('dictator_token');
    await fetch(`${API_BASE}/api/sessions?id=${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // --- ADMIN ---
  async getAdminStats() {
    const token = localStorage.getItem('dictator_token');
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async getAdminUsers() {
    const token = localStorage.getItem('dictator_token');
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async deleteAdminUser(userId: string) {
    const token = localStorage.getItem('dictator_token');
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async getAdminUserChats(userId: string) {
    const token = localStorage.getItem('dictator_token');
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}/chats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // --- FEEDBACK ---
  async submitFeedback(sessionId: string, messageId: string, feedback: 'like' | 'dislike', feedbackText?: string) {
    const token = localStorage.getItem('dictator_token');
    const response = await fetch(`${API_BASE}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ sessionId, messageId, feedback, feedbackText })
    });
    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }
  },

  // --- SUBSCRIPTIONS ---
  async createPayment(plan: 'infantry' | 'commander') {
    const token = localStorage.getItem('dictator_token');
    const response = await fetch(`${API_BASE}/api/create-payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
    });
    
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Payment Init Failed');
    }
    return response.json();
  },

  async buySubscription(plan: 'infantry' | 'commander') {
    // Legacy / Mock method - keeping for reference or fallback if needed
    const token = localStorage.getItem('dictator_token');
    const response = await fetch(`${API_BASE}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plan })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Subscription Failed');
    }
    return response.json();
  }
};
