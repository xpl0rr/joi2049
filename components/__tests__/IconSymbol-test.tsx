import React from 'react';
import renderer from 'react-test-renderer';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { IconSymbol } from '../ui/IconSymbol';

jest.mock('@expo/vector-icons/MaterialIcons', () => jest.fn(() => null));

describe('IconSymbol', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const cases: Array<[Parameters<typeof IconSymbol>[0]['name'], string]> = [
    ['house.fill', 'home'],
    ['paperplane.fill', 'send'],
    ['chevron.left.forwardslash.chevron.right', 'code'],
    ['chevron.right', 'chevron-right'],
  ];

  it.each(cases)('maps %s to %s', (input, expected) => {
    renderer.create(<IconSymbol name={input} color="red" />);
    expect(MaterialIcons).toHaveBeenCalledWith(
      expect.objectContaining({ name: expected }),
      {}
    );
  });
});
