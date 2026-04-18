import api from './api';

const cardService = {
  async getCards() {
    return await api.get('/cards/');
  },
  
  async requestCard(cardData) {
    return await api.post('/cards/request', cardData);
  },

  async blockCard(cardId, reason) {
    return await api.post(`/cards/${cardId}/block`, { reason });
  }
};

export default cardService;
