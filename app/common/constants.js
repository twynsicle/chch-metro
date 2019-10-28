export const HEARTBEAT_POLL_FREQUENCY = 6 * 1000;

export const SCHEDULE_POLL_FREQUENCY = 30 * 1000;

export const COMPANION_CONNECTION_TIMEOUT = 11 * 1000;

export const PLATFORM_SETTING = 'platformSetting';

export const AppState = {
    none: 0,
    loading: 1,
    update: 2,
    error: 3,
    companionTimeout: 4,
};

export const MessageType = {
    none: 0,
    heartbeat: 1,
    schedule: 2,
};
