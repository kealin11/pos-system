export const getRandomBG = () => {
    const colors = [
        "#f6b100",
        "#025cca",
        "#02ca3a",
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return "bg-[" + color + "]";
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount || 0);
};