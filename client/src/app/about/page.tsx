import React from 'react';
import { Building2, Users, Trophy, Target } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { label: 'Happy Clients', value: '10K+', icon: Users },
    { label: 'Properties Sold', value: '5K+', icon: Building2 },
    { label: 'Awards Won', value: '15+', icon: Trophy },
    { label: 'Years Experience', value: '10+', icon: Target },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="text-primary">RealEstate Pro</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            We are Pakistan's premier real estate platform, dedicated to helping you find your dream home or the perfect investment opportunity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-card border border-border p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Content Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              At RealEstate Pro, our mission is to simplify the real estate journey for everyone. Whether you are buying your first home, selling an inherited property, or looking for commercial space, we provide the tools, expertise, and support you need to make informed decisions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We believe in transparency, integrity, and putting our clients first. Our platform connects buyers with sellers and tenants with landlords in a seamless, secure, and efficient manner.
            </p>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden bg-muted">
            <img
              src="https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80"
              alt="Building"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
