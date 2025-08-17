import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Home from '../app/page';

jest.mock('@/components/navbar', () => () => <header id="navbar" />);
jest.mock('@/components/hero', () => () => <section id="hero" />);
jest.mock('@/components/feature', () => () => <section id="features" />);
jest.mock('@/components/footer', () => () => <footer id="footer" />);
jest.mock('@/components/cookie-card', () => () => <div id="cookieConsent" />);

describe('Home Page', () => {
  it('renders all Component by id', () => {
    render(<Home />);

    expect(document.getElementById('navbar')).toBeInTheDocument();
    expect(document.getElementById('hero')).toBeInTheDocument();
    expect(document.getElementById('features')).toBeInTheDocument();
    expect(document.getElementById('footer')).toBeInTheDocument();
    expect(document.getElementById('cookieConsent')).toBeInTheDocument();
  });
});
