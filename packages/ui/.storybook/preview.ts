import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes"; // 🔴 ADDED
import "../src/styles.css";

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: "^on[A-Z].*" },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
    // 🔴 ADDED: Decorators for Tailwind Dark Mode
    decorators: [
        withThemeByClassName({
            themes: {
                light: "light",
                dark: "dark",
            },
            defaultTheme: "light",
        }),
    ],
};

export default preview;
