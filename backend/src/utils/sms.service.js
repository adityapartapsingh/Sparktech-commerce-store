const logger = require('./logger');

const MSG91_API_URL = 'https://control.msg91.com/api/v5/flow';

/**
 * Core SMS sender via MSG91 Flow API
 * @param {string} phone — Recipient phone (with country code, e.g., "919876543210")
 * @param {string} flowId — MSG91 Flow/template ID
 * @param {Object} variables — Template placeholder variables (e.g., { VAR1: 'value' })
 */
const sendFlowSMS = async (phone, flowId, variables = {}) => {
  const authKey = process.env.MSG91_AUTH_KEY;

  if (!authKey) {
    logger.info(`[DEV SMS] Flow: ${flowId} | To: ${phone} | Vars: ${JSON.stringify(variables)}`);
    return { success: true, dev: true };
  }

  if (!flowId) {
    logger.warn(`[SMS] No flow ID provided, skipping SMS to ${phone}`);
    return { success: false, reason: 'no_flow_id' };
  }

  // Normalize phone — strip +, ensure country code
  const normalizedPhone = phone.replace(/[^0-9]/g, '');
  const countryCode = process.env.MSG91_COUNTRY_CODE || '91';
  const fullPhone = normalizedPhone.startsWith(countryCode)
    ? normalizedPhone
    : `${countryCode}${normalizedPhone}`;

  const payload = {
    template_id: flowId,
    short_url: '0',
    recipients: [
      {
        mobiles: fullPhone,
        ...variables,
      },
    ],
  };

  try {
    const response = await fetch(MSG91_API_URL, {
      method: 'POST',
      headers: {
        authkey: authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      logger.info(`[SMS] Sent to ${fullPhone} via flow ${flowId}`);
      return { success: true, data };
    } else {
      logger.error(`[SMS] MSG91 error: ${JSON.stringify(data)}`);
      return { success: false, data };
    }
  } catch (error) {
    logger.error(`[SMS] Network error sending to ${fullPhone}: ${error.message}`);
    return { success: false, error: error.message };
  }
};



// Send order confirmation SMS
const sendOrderConfirmationSMS = async (phone, orderId, totalAmount) => {
  if (!phone) return;
  const flowId = process.env.MSG91_FLOW_ORDER_CONFIRM;
  return sendFlowSMS(phone, flowId, {
    ORDER_ID: orderId.toString().slice(-8).toUpperCase(),
    AMOUNT: `₹${Number(totalAmount).toLocaleString('en-IN')}`,
  });
};


// Send shipped SMS with tracking info 
const sendShippedSMS = async (phone, orderId, trackingNumber, provider) => {
  if (!phone) return;
  const flowId = process.env.MSG91_FLOW_SHIPPED;
  return sendFlowSMS(phone, flowId, {
    ORDER_ID: orderId.toString().slice(-8).toUpperCase(),
    TRACKING_NUMBER: trackingNumber || 'N/A',
    PROVIDER: provider || 'Our logistics partner',
  });
};


// Send delivered SMS
const sendDeliveredSMS = async (phone, orderId) => {
  if (!phone) return;
  const flowId = process.env.MSG91_FLOW_DELIVERED;
  return sendFlowSMS(phone, flowId, {
    ORDER_ID: orderId.toString().slice(-8).toUpperCase(),
  });
};

// Send cancellation SMS
const sendCancellationSMS = async (phone, orderId) => {
  if (!phone) return;
  const flowId = process.env.MSG91_FLOW_CANCELLED;
  return sendFlowSMS(phone, flowId, {
    ORDER_ID: orderId.toString().slice(-8).toUpperCase(),
  });
};

module.exports = {
  sendFlowSMS,
  sendOrderConfirmationSMS,
  sendShippedSMS,
  sendDeliveredSMS,
  sendCancellationSMS,
};
