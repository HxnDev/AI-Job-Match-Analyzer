export default {
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:5001",
                changeOrigin: true,
                secure: false,
            },
        },
    },
};
