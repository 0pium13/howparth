import React from 'react';
import Hero from '../components/Hero';
import SophisticatedProcessSection from '../components/SophisticatedProcessSection';
import AnimatedSection from '../components/AnimatedSection';
import OutlineTextSection from '../components/OutlineTextSection';
import ImpactStatement from '../components/ImpactStatement';
import SectionDivider from '../components/SectionDivider';

const Home: React.FC = () => {
  return (
    <div className="bg-primary">
      <Hero />
      <SectionDivider />
      <OutlineTextSection />
      <SectionDivider />
      <SophisticatedProcessSection />
      <SectionDivider />
      <ImpactStatement />
      <SectionDivider />
      <AnimatedSection />
    </div>
  );
};

export default Home;
