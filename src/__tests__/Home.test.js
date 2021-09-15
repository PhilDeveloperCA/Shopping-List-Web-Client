import React from 'react';
import {render, cleanup,  fireEvent, waitFor, screen} from '@testing-library/react';
import Home from '../views/Home/Home.tsx';

import '@testing-library/jest-dom/extend-expect';

import 'jest-axe/extend-expect';

import '@testing-library/react/dont-cleanup-after-each';

import 'msw/node'
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.post('/api/local-signup', (req,res,next) => {
    return res(ctx.json({username:"Prano", jwt:"spodk12-0f-01i20-1jrp2jop1o2"}));
  }),
  rest.post('/api/groups', (req,res,next) => {
    const name = req.body.name;
    if(!name){
      return res(ctx.status(400).json({err:"Missing Fields"}));
    }
    return res(ctx.json({id:3, name:"Poopo Johnson"}));
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Home', () => {
    it('Shoulder Render Without Crashing', () => {
        const {container} = render(<Home />);
        const input = container.querySelector('#Add Group');
        fireEvent.change(input, {target: {value: 'Good Day'}})
        fireEvent.click(screen.getByText("Submit"));
        expect(input.value).toBe('') // empty before
        expect(container).toHaveTextContent("Yo Momma");
    })
    it('Should Add 1 Group On Correct Fetch', () => {
      
    })
})

/*import { render } from 'react-testing-library';import MyComponent from './MyComponent';describe('MyComponent', () => {
  it('should render without crashing, () => {
    const { container } = render(<MyComponent />);
  
    expect(container).toHaveTextContent('Component Title');
  });
});*/