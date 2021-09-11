/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *


import { Accordion } from './Accordion';

describe('Accordion', () => {
  const text = 'pirojok';
  const title = 'pelmeni';

  it('does not display the content initially', async () => {
    const { queryByText } = await render(
      <Accordion title={title}>
        <div>{text}</div>
      </Accordion>
    );
    expect(queryByText(text)).toBeNull();
  });

  it('toggles content on header click', async () => {
    const { queryByText, getByText } = await render(
      <Accordion title={title}>
        <div>{text}</div>
      </Accordion>
    );

    // Open
    await act(async () => {
      await fireEvent.click(getByText(title));
    });

    expect(queryByText(text)).toBeDefined();

    // Close
    await act(async () => {
      await fireEvent.click(getByText(title));
    });

    expect(queryByText(text)).toBeNull();
  });
});
