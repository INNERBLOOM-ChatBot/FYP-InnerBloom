import React from 'react';
import './WhyChoose.css'; 
import { features } from './FeatureContent'; 

const WhyChoose = (prop) => {
  return (
    <section className="why-choose-section"> 
      <h2 className="why-choose-header">Why Choose InnerBloom?</h2> 
      <p className="why-choose-subheader">AI-Powered Conversations: Talk naturally through text or voice – our empathetic AI listens, understands your emotions and responds with kindness.
Complete Privacy: Your conversations are fully encrypted and confidential. We follow strict privacy standards – your safe space is truly yours.
</p> 
      
      <div className="grid"> 
        {features.map((feature, index) => ( 
          <div key={index} className="card"> 
            <div className="icon">{feature.icon}</div> 
            <h3 className="title">{feature.title}</h3> 
            <p className="description">{feature.description}</p> 
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChoose;