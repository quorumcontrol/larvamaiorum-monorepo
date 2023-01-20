const theme = require('../src/main-site-components/theme')

export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    chakra: {
        theme,
    },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
}