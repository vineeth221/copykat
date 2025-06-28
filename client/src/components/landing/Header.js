import React from 'react'
import './Home.css'

const Header = () => {
  return (
    <div>
        <div id="nav-main-head" className="nav-sprite">
  <div className="nav-left">
    <a href="#" id="nav-hamburger-menu" role="button" aria-label="Open All Categories Menu" aria-expanded="false">
      <i className="hm-icon nav-sprite"></i>
    </a>
  </div>
  <div className="nav-fill">
    <div id="nav-xshop-container">
      <div id="nav-xshop" className="nav-progressive-content">
      <a href="/home" className="nav-a"  data-csa-c-type="link" data-csa-c-id="nav_cs_watches">Home</a>
      <a href="/clothes" className="nav-a"  data-csa-c-type="link" data-csa-c-id="nav_cs_clothes_shoes">Clothing</a>
        <a href="/#" className="nav-a"  data-csa-c-type="link" data-csa-c-id="nav_cs_watches">Watches</a>
        <a href="/#" className="nav-a" data-csa-c-type="link" data-csa-c-id="nav_cs_clothes_shoes">Shoes</a>
        <a href="/perfumes" className="nav-a" data-csa-c-type="link" data-csa-c-id="nav_cs_perfumes">Perfumes</a>
        <a href="/handbags" className="nav-a"  data-csa-c-type="link" data-csa-c-id="nav_cs_handbags">Handbags</a>
      </div>
    </div>
  </div>
</div>
    </div>
  )
}

export default Header