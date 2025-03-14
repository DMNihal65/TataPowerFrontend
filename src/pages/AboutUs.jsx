import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Wind, Zap, Globe } from 'lucide-react';
import logo from '../assets/tata_power.png'


const AboutUs = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Navigation */}
      <div className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center py-6 px-8">
            <div className="flex items-center gap-8">
              <img 
                src={logo}
                alt="Tata Power Solar Logo" 
                className="h-20 object-contain"
              />
              
            </div>
            <Link 
              to="/tatapowerdoc" 
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all transform hover:scale-105"
            >
             Login
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section with Animation */}
      <div className="relative w-full h-screen">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url('https://www.tatapowersolar.com/wp-content/uploads/2023/03/tata-power-solar-rooftop-banner.jpg')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20 max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
              Powering a <span className="text-green-500">Sustainable</span> Future
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mb-8 animate-fade-in-delay">
              India's largest integrated solar company dedicated to making clean energy accessible to all.
            </p>
           
          </div>
        </div>
      </div>

      {/* Floating Stats Cards */}
      <div className="relative z-10 -mt-32 pb-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-xl transform hover:-translate-y-2 transition-all duration-300 backdrop-blur-lg">
              <div className="text-green-600 mb-4">
                <Sun size={40} />
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-2">32+</h3>
              <p className="text-gray-600">Years of Excellence</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl transform hover:-translate-y-2 transition-all duration-300 backdrop-blur-lg">
              <div className="text-green-600 mb-4">
                <Wind size={40} />
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-2">1000+</h3>
              <p className="text-gray-600">Happy Employees</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl transform hover:-translate-y-2 transition-all duration-300 backdrop-blur-lg">
              <div className="text-green-600 mb-4">
                <Zap size={40} />
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-2">20M+</h3>
              <p className="text-gray-600">Tonnes Carbon Footprint Reduced</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl transform hover:-translate-y-2 transition-all duration-300 backdrop-blur-lg">
              <div className="text-green-600 mb-4">
                <Globe size={40} />
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-2">3 GW</h3>
              <p className="text-gray-600">Modules Shipped Worldwide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-4">Our Solar Solutions</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Discover our state-of-the-art solar installations powering homes, businesses, and industries across India
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Large Industrial Installation */}
            <div className="group relative overflow-hidden rounded-xl shadow-lg aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop&q=60" 
                alt="Industrial Solar Installation"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-bold mb-2">Industrial Solutions</h3>
                  <p className="text-white/90">Large-scale solar installations for industrial applications</p>
                </div>
              </div>
            </div>

            {/* Commercial Rooftop */}
            <div className="group relative overflow-hidden rounded-xl shadow-lg aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=800&auto=format&fit=crop&q=60" 
                alt="Commercial Rooftop Solar"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-bold mb-2">Commercial Rooftop</h3>
                  <p className="text-white/90">Efficient solar solutions for commercial buildings</p>
                </div>
              </div>
            </div>

            {/* Ground Mounted */}
            <div className="group relative overflow-hidden rounded-xl shadow-lg aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800&auto=format&fit=crop&q=60" 
                alt="Ground Mounted Solar"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-bold mb-2">Ground Mounted Solutions</h3>
                  <p className="text-white/90">High-capacity ground-mounted solar installations</p>
                </div>
              </div>
            </div>

            {/* Manufacturing */}
            <div className="group relative overflow-hidden rounded-xl shadow-lg aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=60" 
                alt="Solar Manufacturing"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-bold mb-2">Manufacturing Excellence</h3>
                  <p className="text-white/90">State-of-the-art solar module manufacturing</p>
                </div>
              </div>
            </div>

            {/* Utility Scale */}
            <div className="group relative overflow-hidden rounded-xl shadow-lg aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1592833159155-c62df1b65634?w=800&auto=format&fit=crop&q=60" 
                alt="Utility Scale Solar"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-bold mb-2">Utility Scale Projects</h3>
                  <p className="text-white/90">Large-scale solar farms for utilities</p>
                </div>
              </div>
            </div>

            {/* Residential */}
            <div className="group relative overflow-hidden rounded-xl shadow-lg aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&auto=format&fit=crop&q=60" 
                alt="Residential Solar"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-bold mb-2">Residential Solutions</h3>
                  <p className="text-white/90">Smart solar solutions for homes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Mission Section with Parallax */}
      <div id="vision" className="py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="bg-white p-12 rounded-xl shadow-lg transform hover:-translate-y-2 transition-all duration-300">
              <h2 className="text-4xl font-bold text-gray-800 mb-8">Our Vision</h2>
              <p className="text-gray-600 text-xl leading-relaxed">
                To be the most admired and responsible integrated power company, delivering sustainable value to all stakeholders.
              </p>
            </div>
            <div className="bg-white p-12 rounded-xl shadow-lg transform hover:-translate-y-2 transition-all duration-300">
              <h2 className="text-4xl font-bold text-gray-800 mb-8">Our Mission</h2>
              <ul className="text-gray-600 text-xl leading-relaxed space-y-4">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Keeping the customer at the centre of all we do
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Operating assets at benchmark levels
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Sustainable growth with market leadership
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Creating an empowered workforce
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section with Hover Effects */}
      <div id="values" className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-20">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center group hover:bg-green-600 transition-all duration-300">
              <h3 className="text-2xl font-bold text-green-600 mb-4 group-hover:text-white">Leadership</h3>
              <p className="text-gray-600 group-hover:text-white/90">Be passionate about leading the way</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center group hover:bg-green-600 transition-all duration-300">
              <h3 className="text-2xl font-bold text-green-600 mb-4 group-hover:text-white">Integrity</h3>
              <p className="text-gray-600 group-hover:text-white/90">Be fair, honest, transparent and ethical in conduct</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center group hover:bg-green-600 transition-all duration-300">
              <h3 className="text-2xl font-bold text-green-600 mb-4 group-hover:text-white">Excellence</h3>
              <p className="text-gray-600 group-hover:text-white/90">Achieve the highest standards of performance</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center group hover:bg-green-600 transition-all duration-300">
              <h3 className="text-2xl font-bold text-green-600 mb-4 group-hover:text-white">Unity</h3>
              <p className="text-gray-600 group-hover:text-white/90">Work together to achieve common goals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div>
              <img 
                src={logo}
                alt="Tata Power Solar Logo" 
                className="h-24 "
              />
              <p className="text-gray-400">Leading the way in renewable energy solutions for a sustainable future.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4">
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#vision" className="text-gray-400 hover:text-white transition-colors">Vision & Mission</a></li>
                <li><a href="#values" className="text-gray-400 hover:text-white transition-colors">Our Values</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6">Contact Us</h4>
              <p className="text-gray-400">Corporate Office: Electronic City Phase 2, Bangalore, India</p>
              <p className="text-gray-400 mt-4">Email: info@tatapowersolar.com</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-16 pt-8 text-center">
            <p className="text-gray-400">© 2024 Tata Power Solar. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Add styles for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: fadeIn 1s ease-out 0.3s forwards;
          opacity: 0;
        }
        .animate-fade-in-delay-2 {
          animation: fadeIn 1s ease-out 0.6s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default AboutUs;