import React from 'react';
import '../css/loading.css';

interface LoadingProps {
  isLoading: boolean;
}

export const LoadingDisplay: React.FC<LoadingProps> = ({isLoading}) => {
  if (!isLoading) return null;
  return (
    <div className="loading-overlay">
      <div className="loading">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="120" height="120">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#2ee7ff"
                  strokeWidth="2" strokeDasharray="63" strokeLinecap="round">
              <animate attributeName="stroke-dashoffset" values="63;16;63" keyTimes="0;.5;1"
                      keySplines=".42 0 .58 1;.42 0 .58 1;" calcMode="spline"
                      dur="1.4s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="rotate" values="0,12,12;135,12,12;450,12,12"
                                keySplines=".42 0 .58 1;.42 0 .58 1;" calcMode="spline"
                                dur="1.4s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="rotate" from="0,12,12" to="270,12,12"
                                calcMode="linear" dur="1.4s" repeatCount="indefinite" additive="sum"/>
          </circle>
        </svg>
      </div>
    </div>
  );
}

export default LoadingDisplay;