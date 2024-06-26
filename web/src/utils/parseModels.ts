import { produce } from 'immer';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/modelProviders';
import { ChatModelCard } from '@/types/llm';

/**
 * Parse model string to add or remove models.
 */
export const parseModelString = (modelString: string = '', withDeploymentName = false) => {
  let models: ChatModelCard[] = [];
  let removeAll = false;
  const removedModels: string[] = [];
  const modelNames = modelString.split(/[,，]/).filter(Boolean);

  for (const item of modelNames) {
    const disable = item.startsWith('-');
    const nameConfig = item.startsWith('+') || item.startsWith('-') ? item.slice(1) : item;
    const [idAndname, ...capabilities] = nameConfig.split('<');
    let [id, name] = idAndname.split('=');

    let deploymentName: string | undefined;

    if (withDeploymentName) {
      [id, deploymentName] = id.split('->');
      if (!deploymentName) deploymentName = id;
    }

    if (disable) {
      // Disable all models.
      if (id === 'all') {
        removeAll = true;
      }
      removedModels.push(id);
      continue;
    }

    // Remove duplicate model entries.
    const existingIndex = models.findIndex(({ id: n }) => n === id);
    if (existingIndex !== -1) {
      models.splice(existingIndex, 1);
    }

    const model: ChatModelCard = {
      name: name || undefined,
      id,
    };

    if (deploymentName) {
      model.deploymentName = deploymentName;
    }

    if (capabilities.length > 0) {
      const [maxTokenStr, ...capabilityList] = capabilities[0].replace('>', '').split(':');
      model.tokens = parseInt(maxTokenStr, 10) || undefined;

      for (const capability of capabilityList) {
        switch (capability) {
          case 'vision': {
            model.vision = true;
            break;
          }
          case 'fc': {
            model.functionCall = true;
            break;
          }
          case 'file': {
            model.files = true;
            break;
          }
          default: {
            console.warn(`Unknown capability: ${capability}`);
          }
        }
      }
    }

    models.push(model);
  }

  return {
    add: models,
    removeAll,
    removed: removedModels,
  };
};

/**
 * Extract a special method to process chatModels
 */
export const transformToChatModelCards = ({
  modelString = '',
  defaultChatModels,
  withDeploymentName = false,
}: {
  defaultChatModels: ChatModelCard[];
  modelString?: string;
  withDeploymentName?: boolean;
}): ChatModelCard[] | undefined => {
  if (!modelString) return undefined;

  const modelConfig = parseModelString(modelString, withDeploymentName);
  let chatModels = modelConfig.removeAll ? [] : defaultChatModels;

  // 处理移除逻辑
  if (!modelConfig.removeAll) {
    chatModels = chatModels.filter((m) => !modelConfig.removed.includes(m.id));
  }

  return produce(chatModels, (draft) => {
    // 处理添加或替换逻辑
    for (const toAddModel of modelConfig.add) {
      // first try to find the model in LOBE_DEFAULT_MODEL_LIST to confirm if it is a known model
      const knownModel = LOBE_DEFAULT_MODEL_LIST.find((model) => model.id === toAddModel.id);

      // if the model is known, update it based on the known model
      if (knownModel) {
        const modelInList = draft.find((model) => model.id === toAddModel.id);

        // if the model is already in chatModels, update it
        if (modelInList) {
          // if (modelInList.hidden) delete modelInList.hidden;
          modelInList.enabled = true;
          if (toAddModel.name) modelInList.name = toAddModel.name;
        } else {
          // if the model is not in chatModels, add it
          draft.push({
            ...knownModel,
            name: toAddModel.name || knownModel.name || knownModel.id,
            enabled: true,
          });
        }
      } else {
        // if the model is not in LOBE_DEFAULT_MODEL_LIST, add it as a new custom model
        draft.push({
          ...toAddModel,
          name: toAddModel.name || toAddModel.id,
          enabled: true,
        });
      }
    }
  });
};

export const extractEnabledModels = (modelString: string = '', withDeploymentName = false) => {
  const modelConfig = parseModelString(modelString, withDeploymentName);
  const list = modelConfig.add.map((m) => m.id);

  if (list.length === 0) return;

  return list;
};
