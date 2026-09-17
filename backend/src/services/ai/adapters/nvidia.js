'use strict';

const { env } = require('../../../config/env');
const { postJson, AiProviderError } = require('../httpJson');

const ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';

module.exports = {
  name: 'nvidia',
  isConfigured() {
    return Boolean(env.nvidiaKey && env.nvidiaModel);
  },
  get model() {
    return env.nvidiaModel;
  },
  async complete({ system, prompt, maxTokens = 900, temperature = 0.3 }) {
    if (!env.nvidiaKey) {
      throw new AiProviderError('auth', 'NVIDIA key is not configured');
    }
    const payload = await postJson(
      ENDPOINT,
      {
        model: env.nvidiaModel,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      },
      { Authorization: `Bearer ${env.nvidiaKey}` }
    );

    const content =
      payload &&
      payload.choices &&
      payload.choices[0] &&
      payload.choices[0].message &&
      payload.choices[0].message.content;

    if (!content || !String(content).trim()) {
      throw new AiProviderError('empty', 'NVIDIA returned no content');
    }
    return { text: String(content), model: env.nvidiaModel };
  },
};
