import type { Meta, StoryObj } from '@storybook/react';

import BattleUI from './BattleUI';
// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof BattleUI> = {
  title: 'Delphs/BattelUI',
  component: BattleUI,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  // tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    // defaultValue: { control: 'number' },
  },
};

export default meta

type Story = StoryObj<typeof BattleUI>;

export const Primary: Story = {
  args: {
    // defaultValue: 0,
  },
};
