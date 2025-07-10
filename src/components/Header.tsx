import { ConnectButton } from "@rainbow-me/rainbowkit"
import { FaGithub } from "react-icons/fa"

export default function Header() {
  return (
    <header style={headerStyle}>
      <div style={logoContainerStyle}>
        <a
            href="https://github.com/Jack-OuCJ/ts-tsender-ui-ou"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors"
        >
        <FaGithub style={iconStyle} />
        </a>
        <h1 style={titleStyle}>TSender</h1>
      </div>
      <ConnectButton />
    </header>
  );
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 20px',
  backgroundColor: '#f5f5f5',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const logoContainerStyle = {
  display: 'flex',
  alignItems: 'center',
};

const titleStyle = {
  marginLeft: '10px'
};

const iconStyle = {
  fontSize: '24px',
};