import type { Meta, StoryObj } from '@storybook/react';

import BattleSlider from './BattleSlider';
// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof BattleSlider> = {
  title: 'Delphs/BattleSlider',
  component: BattleSlider,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  // tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    value: { control: 'number' },
  },
};

export default meta

type Story = StoryObj<typeof BattleSlider>;

export const Primary: Story = {
  args: {
    value: 20,
  },
};
