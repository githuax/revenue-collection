const STATES = [
    {
        name: 'Pending',
        color: '#FFA500', // Orange
    },
    {
        name: 'Refunded',
        color: '#0000FF', // Blue
    },
    {
        name: 'Completed',
        color: '#008000', // Green
    },
    {
        name: 'Cancelled',
        color: '#800080', // Purple
    },
    {
        name: 'Conflicted',
        color: '#FF0000', // Red
    }
] as const;

export {
    STATES
}