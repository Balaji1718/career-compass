'use strict';

const { env } = require('../../../config/env');
const { postJson, AiProviderError } = require('../httpJson');

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

module.exports = {
  name: 'openrouter',
  isConfigured() {
    return Boolean(env.openRouterKey);
  },
  get model() {
    return env.openRouterModel;
  },
  /** Returns the raw assistant text. Caller validates the structure. */
  async complete({ system, prompt, maxTokens = 900, temperature = 0.3 }) {
    if (!env.openRouterKey) {
      throw new AiProviderError('auth', 'OpenRouter key is not configured');
    }
    const payload = await postJson(
      ENDPOINT,
      {
        model: env.openRouterModel,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      },
      {
        Authorization: `Bearer ${env.openRouterKey}`,
        'X-Title': 'Career Compass',
      }
    );

    const content =
      payload &&
      payload.choices &&
      payload.choices[0] &&
      payload.choices[0].message &&
      payload.choices[0].message.content;

    if (!content || !String(content).trim()) {
      throw new AiProviderError('empty', 'OpenRouter returned no content');
    }
    return { text: String(content), model: env.openRouterModel };
  },
};
