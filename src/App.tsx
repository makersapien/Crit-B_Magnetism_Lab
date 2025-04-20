import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    jspdf: any;
  }
}
const App = () => {
    const [screen, setScreen] = useState('welcome');
    const [studentName, setStudentName] = useState('');
    const [currentStrand, setCurrentStrand] = useState(1);
    const [strandProgress, setStrandProgress] = useState([0, 0, 0, 0]);
    const [currentTab, setCurrentTab] = useState('guided');
    const [experimentChoice, setExperimentChoice] = useState(null);
    const [showLevelDetails, setShowLevelDetails] = useState({
      level3: false,
      level4: false,
      level6: false,
      level8: false
    });
    const [userInputs, setUserInputs] = useState({
      strand1: { level3: '', level4: '', level6: '', level8: '' },
      strand2: { level3: '', level4: '', level6: '', level8: '' },
      strand3: { level3: '', level4: '', level6: '', level8: '' },
      strand4: { level3: '', level4: '', level6: '', level8: '' }
    });
    const [earnedBadges, setEarnedBadges] = useState({
      questionCrafter: false,
      curieCommander: false,
      variableVirtuoso: false,
      methodMaster: false
    });
    const [points, setPoints] = useState(0);
    const [strandStatus, setStrandStatus] = useState([
      'in progress', 'not started', 'not started', 'not started'
    ]);
    const [showBadgeAnimation, setShowBadgeAnimation] = useState(null);
    const goToPreviousStrand = () => {
      if (currentStrand > 1) {
        // Evaluate current strand before moving
        evaluateStrand(currentStrand);
        // Navigate to previous strand
        setCurrentStrand(currentStrand - 1);
      }
    };
    
    const goToNextStrand = () => {
      // Evaluate the current strand first
      const currentLevel = evaluateStrand(currentStrand);
      
      if (currentStrand < 4) {
        // If not at the last strand, move to next strand
        setCurrentStrand(currentStrand + 1);
      } else {
        // If at the last strand (4), evaluate all strands and go to results
        // We've already evaluated the current strand above
        
        // Mark all strands as completed if they have a level >= 3
        const newStatus = [...strandStatus];
        for (let i = 0; i < 4; i++) {
          if (strandProgress[i] >= 3) {
            newStatus[i] = 'completed';
          }
        }
        setStrandStatus(newStatus);
        
        // Go to results screen
        setScreen('results');
      }
    };
    // Update strand status when navigating
    useEffect(() => {
      const newStatus = [...strandStatus];
      if (newStatus[currentStrand - 1] === 'not started') {
        newStatus[currentStrand - 1] = 'in progress';
        setStrandStatus(newStatus);
      }
    }, [currentStrand]);
  
    // Award badges based on progress
    const awardBadge = (badgeName) => {
      if (!earnedBadges[badgeName]) {
        const newBadges = {...earnedBadges};
        newBadges[badgeName] = true;
        setEarnedBadges(newBadges);
        setShowBadgeAnimation(badgeName);
        setTimeout(() => setShowBadgeAnimation(null), 3000);
        setPoints(prevPoints => prevPoints + 25);
      }
    };
    // Add this function to detect key concepts rather than matching exemplars
    const analyzeConceptsCoverage = (text, experimentType) => {
      if (!text || text.length < 20) return { score: 0, concepts: [] };
      
      const content = text.toLowerCase();
      
      // Define key scientific concepts that should be present in a quality response
      // These are more flexible than exact keywords
      const keyConcepts = {
        distance: [
          { name: "IV Range Specification", pattern: /(range|between).*(cm|centimeter|distance)/i, level: 6 },
          { name: "Measurement Method", pattern: /(measure|count|paper clip|attract)/i, level: 6 },
          { name: "Control Variables", pattern: /(control|constant|same|keep|maintained)/i, level: 6 },
          { name: "Inverse Square Law", pattern: /(inverse square|proportional|diminish|weaken)/i, level: 8 },
          { name: "Field Lines", pattern: /(field lines|magnetic field|flux|direction)/i, level: 8 },
          { name: "Scientific Principle", pattern: /(law|theory|principle|relation)/i, level: 8 },
        ],
        magnets: [
          { name: "IV Range Specification", pattern: /(range|between).*(1 to 5|number of magnet|stack)/i, level: 6 },
          { name: "Measurement Method", pattern: /(measure|count|paper clip|attract)/i, level: 6 },
          { name: "Control Variables", pattern: /(control|constant|same|keep|maintained)/i, level: 6 },
          { name: "Field Addition", pattern: /(add|combined|alignment|stronger field)/i, level: 8 },
          { name: "Magnetic Domains", pattern: /(domain|field|alignment|dipole)/i, level: 8 },
          { name: "Scientific Principle", pattern: /(theory|principle|relation|constructive)/i, level: 8 },
        ]
      };
      
      // Get the right concept set for the experiment
      const conceptSet = keyConcepts[experimentType] || keyConcepts.distance;
      
      // Check for each concept
      const detectedConcepts = [];
      let level6Count = 0;
      let level8Count = 0;
      
      conceptSet.forEach(concept => {
        if (concept.pattern.test(content)) {
          detectedConcepts.push(concept);
          if (concept.level === 6) level6Count++;
          if (concept.level === 8) level8Count++;
        }
      });
      
      // Calculate a score based on concept coverage
      let score = 0;
      
      // Level 3-4 basic elements (simple presence of a question)
      if (content.length > 50 && /how|what|does|affect/i.test(content)) {
        score = 3;
      }
      
      // Level 6 elements (details, ranges, measures)
      if (level6Count >= 2) score = 6;
      
      // Level 8 elements (scientific principles)
      if (level6Count >= 2 && level8Count >= 2) score = 8;
      
      return { 
        score, 
        concepts: detectedConcepts,
        conceptCounts: {
          level6: level6Count,
          level8: level8Count
        }
      };
    };
        // Add this right before or after your evaluateStrand function
    const analyzeStrand1 = (text) => {
      if (!text) return { score: 0, keywords: [] };
      
      // Convert text to lowercase for case-insensitive matching
      const content = text.toLowerCase();
      
      // Define keywords relevant to Research Question quality levels
      const keywordGroups = [
        // Level 3-4 keywords
        { 
          words: ['how', 'what', 'does', 'affect', 'effect', 'impact', 'influence', 'relationship'],
          level: 'level3',
          weight: 1,
          color: 'yellow' 
        },
        // Level 6 keywords
        { 
          words: ['range', 'between', 'measured', 'measuring', 'constant', 'control', 'variables'],
          level: 'level6',
          weight: 2,
          color: 'blue'
        },
        // Level 8 keywords - experiment specific
        { 
          words: experimentChoice === 'distance' 
            ? ['magnetic field', 'inverse square', 'field lines', 'proportional', 'law']
            : experimentChoice === 'magnets' 
              ? ['magnetic field', 'domains', 'alignment', 'field addition', 'combined']
              : ['magnetic field', 'domains', 'alignment'],
          level: 'level8',
          weight: 3,
          color: 'green'
        }
      ];
      
      // Match keywords in text
      const matchedKeywords = [];
      let score = 0;
      
      keywordGroups.forEach(group => {
        group.words.forEach(word => {
          if (content.includes(word.toLowerCase())) {
            // If the keyword is found, add it to our matches
            matchedKeywords.push({
              word: word,
              level: group.level,
              weight: group.weight,
              color: group.color
            });
            score += group.weight;
          }
        });
      });
      
      // Consider text length and structure
      if (text.length > 100) score += 1;
      if (text.length > 200) score += 2;
      
      // Calculate approximate level based on score
      const level = Math.min(8, Math.max(0, Math.floor(score / 3)));
      
      return { score, level, keywords: matchedKeywords };
    };
    // Analysis function for Strand 2 (Hypothesis)
    const analyzeStrand2 = (text, experimentChoice) => {
      if (!text) return { score: 0, keywords: [] };
      
      // Convert text to lowercase for case-insensitive matching
      const content = text.toLowerCase();
      
      // Define keywords relevant to Hypothesis quality levels based on experiment type
      const keywordGroups = [
        // Level 3-4 keywords - basic hypothesis structure
        { 
          words: ['if', 'then', 'will', 'increase', 'decrease', 'affect', 'effect', 'because'],
          level: 'level3',
          weight: 1,
          color: 'yellow' 
        },
        // Level 6 keywords - measurement methods and control variables
        { 
          words: ['range', 'between', 'measured', 'measuring', 'constant', 'control', 'variables', 'paper clip'],
          level: 'level6',
          weight: 2,
          color: 'blue'
        },
        // Level 8 keywords - scientific reasoning - experiment specific
        { 
          words: experimentChoice === 'distance' 
            ? ['inverse square', 'field lines', 'proportional', 'diminish', 'weaken', 'spread out', 'magnetic field strength', 'magnetism']
            : experimentChoice === 'magnets' 
              ? ['combined', 'alignment', 'stronger field', 'additive', 'cumulative', 'domains', 'magnetism', 'dipoles']
              : ['thermal energy', 'vibration', 'domains', 'alignment', 'curie', 'temperature'],
          level: 'level8',
          weight: 3,
          color: 'green'
        }
      ];
      
      // Match keywords in text
      const matchedKeywords = [];
      let score = 0;
      
      keywordGroups.forEach(group => {
        group.words.forEach(word => {
          if (content.includes(word.toLowerCase())) {
            // If the keyword is found, add it to our matches
            matchedKeywords.push({
              word: word,
              level: group.level,
              weight: group.weight,
              color: group.color
            });
            score += group.weight;
          }
        });
      });
      
      // Consider text length and structure (longer hypotheses with scientific reasoning tend to be higher level)
      if (text.length > 100) score += 1;
      if (text.length > 200) score += 2;
      
      // Check for "if-then" structure (essential for a hypothesis)
      const hasIfThenStructure = /(if|when|as).+(then|will)/i.test(content);
      if (!hasIfThenStructure) {
        score = Math.min(score, 2); // Cap score at level 2 if missing if-then structure
      }
      
      // Check for scientific reasoning (required for level 8)
      const hasReasoning = /(because|due to|reason|explains|this occurs|this happens|caused by)/i.test(content);
      if (!hasReasoning && score > 15) {
        score = 15; // Cap score if missing scientific reasoning explanation
      }
      
      // Calculate approximate level based on score
      const level = Math.min(8, Math.max(0, Math.floor(score / 3)));
      
      return { score, level, keywords: matchedKeywords };
    };
    // Analysis function for Strand 3 (Variables)
    const analyzeStrand3 = (text, experimentChoice) => {
      if (!text) return { score: 0, keywords: [] };
      
      // Convert text to lowercase for case-insensitive matching
      const content = text.toLowerCase();
      
      // Define keywords relevant to Variables quality levels based on experiment type
      const keywordGroups = [
        // Level 3-4 keywords - basic variable identification
        { 
          words: ['independent variable', 'dependent variable', 'control variable', 'IV', 'DV', 'CV', 'manipulate', 'measure'],
          level: 'level3',
          weight: 1,
          color: 'yellow' 
        },
        // Level 6 keywords - measurement and control methods
        { 
          words: ['range', 'values', 'measured', 'measuring', 'method', 'trials', 'constant', 'control', 'kept constant'],
          level: 'level6',
          weight: 2,
          color: 'blue'
        },
        // Level 8 keywords - detailed methodology and precision - experiment specific
        { 
          words: experimentChoice === 'distance' 
            ? ['precise', 'accurately', 'verified', 'specifically', 'controlled', 'fixed position', 'digital', 'environmental factors']
            : experimentChoice === 'magnets' 
              ? ['precise', 'accurately', 'verified', 'alignment', 'stack', 'identical magnets', 'holding device', 'environmental factors']
              : ['precise', 'accurately', 'verified', 'temperature control', 'specific values', 'thermometer', 'timing', 'environmental factors'],
          level: 'level8',
          weight: 3,
          color: 'green'
        }
      ];
      
      // Match keywords in text
      const matchedKeywords = [];
      let score = 0;
      
      keywordGroups.forEach(group => {
        group.words.forEach(word => {
          if (content.includes(word.toLowerCase())) {
            // If the keyword is found, add it to our matches
            matchedKeywords.push({
              word: word,
              level: group.level,
              weight: group.weight,
              color: group.color
            });
            score += group.weight;
          }
        });
      });
      
      // Consider text length and structure
      if (text.length > 150) score += 1;
      if (text.length > 300) score += 2;
      
      // Check for variable structure (IV, DV, CV sections)
      const hasStructure = /independent variable.*dependent variable.*control variable/is.test(content);
      if (hasStructure) score += 3;
      
      // Calculate approximate level based on score
      const level = Math.min(8, Math.max(0, Math.floor(score / 4)));
      
      return { score, level, keywords: matchedKeywords };
    };
    // Concept coverage analysis for Strand 2 (Hypothesis)
    const analyzeHypothesisConcepts = (text, experimentType) => {
      if (!text || text.length < 20) return { score: 0, concepts: [] };
      
      const content = text.toLowerCase();
      
      // Define key concepts that should be present in a quality hypothesis
      const keyConcepts = {
        distance: [
          // Level 3-4 concepts
          { name: "If-Then Structure", pattern: /(if|when).+(then|will)/i, level: 4 },
          { name: "Basic Relationship", pattern: /(increase|decrease|change|affect).+(strength|field)/i, level: 4 },
          
          // Level 6 concepts
          { name: "IV Range Specification", pattern: /(range|between).*(cm|centimeter|distance)/i, level: 6 },
          { name: "Measurement Method", pattern: /(measure|count|paper clip|attract)/i, level: 6 },
          { name: "Control Variables", pattern: /(control|constant|same|keep|maintained)/i, level: 6 },
          
          // Level 8 concepts
          { name: "Inverse Square Law", pattern: /(inverse square|proportion|1\/r²)/i, level: 8 },
          { name: "Field Lines Spreading", pattern: /(spread|extend|diverge|field lines)/i, level: 8 },
          { name: "Scientific Reasoning", pattern: /(because|due to|reason|explains|this occurs|this happens|caused by)/i, level: 8 },
          { name: "Mathematical Relationship", pattern: /(proportional|inversely|square|equation|relationship)/i, level: 8 }
        ],
        magnets: [
          // Level 3-4 concepts
          { name: "If-Then Structure", pattern: /(if|when).+(then|will)/i, level: 4 },
          { name: "Basic Relationship", pattern: /(increase|decrease|change|affect).+(strength|field)/i, level: 4 },
          
          // Level 6 concepts
          { name: "IV Range Specification", pattern: /(range|between).*(1 to 5|number of magnet|stack)/i, level: 6 },
          { name: "Measurement Method", pattern: /(measure|count|paper clip|attract)/i, level: 6 },
          { name: "Control Variables", pattern: /(control|constant|same|keep|maintained)/i, level: 6 },
          
          // Level 8 concepts
          { name: "Field Addition", pattern: /(add|combined|alignment|stronger field|superposition)/i, level: 8 },
          { name: "Magnetic Domains", pattern: /(domain|alignment|dipole|cumulative)/i, level: 8 },
          { name: "Scientific Reasoning", pattern: /(because|due to|reason|explains|this occurs|this happens|caused by)/i, level: 8 },
          { name: "Proportional Relationship", pattern: /(proportional|linear|relation|additive)/i, level: 8 }
        ],
        temperature: [
          // Level 3-4 concepts
          { name: "If-Then Structure", pattern: /(if|when).+(then|will)/i, level: 4 },
          { name: "Basic Relationship", pattern: /(increase|decrease|change|affect).+(strength|field)/i, level: 4 },
          
          // Level 6 concepts
          { name: "IV Range Specification", pattern: /(range|between).*(°C|degree|temperature)/i, level: 6 },
          { name: "Measurement Method", pattern: /(measure|count|paper clip|attract)/i, level: 6 },
          { name: "Control Variables", pattern: /(control|constant|same|keep|maintained)/i, level: 6 },
          
          // Level 8 concepts
          { name: "Thermal Effects", pattern: /(thermal|heat|vibration|energy|atom)/i, level: 8 },
          { name: "Domain Disruption", pattern: /(domain|alignment|disrupt|disturb|disorder)/i, level: 8 },
          { name: "Scientific Reasoning", pattern: /(because|due to|reason|explains|this occurs|this happens|caused by)/i, level: 8 },
          { name: "Curie Point Reference", pattern: /(curie|critical|temperature|770|°C)/i, level: 8 }
        ]
      };
      
      // Get the right concept set for the experiment
      const conceptSet = keyConcepts[experimentType] || keyConcepts.distance;
      
      // Check for each concept
      const detectedConcepts = [];
      let level4Count = 0;
      let level6Count = 0;
      let level8Count = 0;
      
      conceptSet.forEach(concept => {
        if (concept.pattern.test(content)) {
          detectedConcepts.push(concept);
          if (concept.level === 4) level4Count++;
          if (concept.level === 6) level6Count++;
          if (concept.level === 8) level8Count++;
        }
      });
      
      // Calculate a score based on concept coverage
      let score = 0;
      
      // Level 3-4 basic elements (if-then structure)
      if (level4Count >= 1) {
        score = 3;
        if (level4Count >= 2) score = 4;
      }
      
      // Level 6 elements (ranges, measurements, controls)
      if (level4Count >= 2 && level6Count >= 1) score = 5;
      if (level4Count >= 2 && level6Count >= 2) score = 6;
      
      // Level 8 elements (scientific reasoning)
      if (level4Count >= 2 && level6Count >= 2 && level8Count >= 1) score = 7;
      if (level4Count >= 2 && level6Count >= 2 && level8Count >= 2) score = 8;
      
      return { 
        score, 
        concepts: detectedConcepts,
        conceptCounts: {
          level4: level4Count,
          level6: level6Count,
          level8: level8Count
        }
      };
    };
    // Concept coverage analysis for Strand 3 (Variables)
    const analyzeVariablesConcepts = (text, experimentType) => {
      if (!text || text.length < 20) return { score: 0, concepts: [] };
      
      const content = text.toLowerCase();
      
      // Define key concepts that should be present in a quality variables section
      const keyConcepts = {
        distance: [
          // Level 3-4 concepts
          { name: "IV Identification", pattern: /independent variable.*distance|distance.*independent variable/i, level: 4 },
          { name: "DV Identification", pattern: /dependent variable.*strength|strength.*dependent variable/i, level: 4 },
          { name: "CV Identification", pattern: /control variable|controlled variable|constant/i, level: 4 },
          
          // Level 6 concepts
          { name: "IV Range", pattern: /(range|between).*(cm|centimeter|distance)/i, level: 6 },
          { name: "IV Manipulation", pattern: /(manipulat|vari|chang|adjust).*(distance|ruler|meter)/i, level: 6 },
          { name: "DV Measurement", pattern: /(measure|count|determin).*(paper clip|strength|attraction)/i, level: 6 },
          { name: "Multiple Trials", pattern: /(trial|repeat|average)/i, level: 6 },
          
          // Level 8 concepts
          { name: "Precise IV Control", pattern: /(precise|accurate|exact).*(measurement|position|distance)/i, level: 8 },
          { name: "Detailed DV Method", pattern: /(digital|camera|record|verif|exact).*(attract|measure|clip)/i, level: 8 },
          { name: "CV Control Methods", pattern: /(same|identical|standard|fixed|control).*(magnet|paper clip|environment)/i, level: 8 },
          { name: "Error Reduction", pattern: /(reduce|minimize|prevent).*(error|variation|inconsistency)/i, level: 8 }
        ],
        magnets: [
          // Level 3-4 concepts
          { name: "IV Identification", pattern: /independent variable.*number of magnet|number of magnet.*independent variable/i, level: 4 },
          { name: "DV Identification", pattern: /dependent variable.*strength|strength.*dependent variable/i, level: 4 },
          { name: "CV Identification", pattern: /control variable|controlled variable|constant/i, level: 4 },
          
          // Level 6 concepts
          { name: "IV Range", pattern: /(range|between).*(1 to 5|number of magnet|stack)/i, level: 6 },
          { name: "IV Manipulation", pattern: /(manipulat|vari|chang|adjust).*(number|stack|add)/i, level: 6 },
          { name: "DV Measurement", pattern: /(measure|count|determin).*(paper clip|strength|attraction)/i, level: 6 },
          { name: "Multiple Trials", pattern: /(trial|repeat|average)/i, level: 6 },
          
          // Level 8 concepts
          { name: "Precise IV Control", pattern: /(alignment|guide|device|identical).*(stack|arrange|orientation)/i, level: 8 },
          { name: "Detailed DV Method", pattern: /(chain|formation|arrangement|consistent).*(measure|clip|attract)/i, level: 8 },
          { name: "CV Control Methods", pattern: /(same|identical|standard|fixed|control).*(magnet|paper clip|environment)/i, level: 8 },
          { name: "Error Reduction", pattern: /(reduce|minimize|prevent).*(error|variation|inconsistency)/i, level: 8 }
        ],
        temperature: [
          // Level 3-4 concepts
          { name: "IV Identification", pattern: /independent variable.*temperature|temperature.*independent variable/i, level: 4 },
          { name: "DV Identification", pattern: /dependent variable.*strength|strength.*dependent variable/i, level: 4 },
          { name: "CV Identification", pattern: /control variable|controlled variable|constant/i, level: 4 },
          
          // Level 6 concepts
          { name: "IV Range", pattern: /(range|between).*(°C|degree|temperature)/i, level: 6 },
          { name: "IV Manipulation", pattern: /(manipulat|vari|chang|adjust|control).*(temperature|heat|cool)/i, level: 6 },
          { name: "DV Measurement", pattern: /(measure|count|determin).*(paper clip|strength|attraction)/i, level: 6 },
          { name: "Multiple Trials", pattern: /(trial|repeat|average)/i, level: 6 },
          
          // Level 8 concepts
          { name: "Precise IV Control", pattern: /(thermometer|precise|accurate|water bath).*(temperature|degree|celsius)/i, level: 8 },
          { name: "Detailed DV Method", pattern: /(chain|formation|arrangement|consistent|quickly).*(measure|clip|attract)/i, level: 8 },
          { name: "CV Control Methods", pattern: /(same|identical|standard|fixed|control).*(magnet|paper clip|environment)/i, level: 8 },
          { name: "Timing Considerations", pattern: /(time|quickly|immediately|rapid).*(measure|remove|change)/i, level: 8 }
        ]
      };
      
      // Get the right concept set for the experiment
      const conceptSet = keyConcepts[experimentType] || keyConcepts.distance;
      
      // Check for each concept
      const detectedConcepts = [];
      let level4Count = 0;
      let level6Count = 0;
      let level8Count = 0;
      
      conceptSet.forEach(concept => {
        if (concept.pattern.test(content)) {
          detectedConcepts.push(concept);
          if (concept.level === 4) level4Count++;
          if (concept.level === 6) level6Count++;
          if (concept.level === 8) level8Count++;
        }
      });
      
      // Calculate a score based on concept coverage
      let score = 0;
      
      // Level 3-4 basic elements (variable identification)
      if (level4Count >= 1) {
        score = 3;
        if (level4Count >= 2) score = 4;
      }
      
      // Level 6 elements (ranges, measurements, controls)
      if (level4Count >= 2 && level6Count >= 1) score = 5;
      if (level4Count >= 2 && level6Count >= 2) score = 6;
      
      // Level 8 elements (precise control and methods)
      if (level4Count >= 2 && level6Count >= 2 && level8Count >= 1) score = 7;
      if (level4Count >= 3 && level6Count >= 3 && level8Count >= 2) score = 8;
      
      return { 
        score, 
        concepts: detectedConcepts,
        conceptCounts: {
          level4: level4Count,
          level6: level6Count,
          level8: level8Count
        }
      };
    };
   

    // Code to be added to handleInputChange for Strand 2
    // This should be integrated with your existing handleInputChange function

    /*
    const handleInputChange = (strand, level, value) => {
      setUserInputs(prev => ({
        ...prev,
        [strand]: {
          ...prev[strand],
          [level]: value
        }
      }));

      // Real-time analysis for Strand 2 (add this to your existing handleInputChange function)
      if (strand === 'strand2' && level === 'level8') {
        // Keyword analysis
        const keywordAnalysis = analyzeStrand2(value, experimentChoice);
        
        // Concept analysis
        const conceptAnalysis = analyzeHypothesisConcepts(value, experimentChoice);
        
        // Combine both approaches - take the higher score
        const combinedLevel = Math.max(keywordAnalysis.level, conceptAnalysis.score);
        
        // Update progress in real-time
        const newProgress = [...strandProgress];
        newProgress[1] = combinedLevel; // Strand 2 is index 1
        setStrandProgress(newProgress);
      }
    };
    */
    // Evaluate strand completion based on grading rubric
    
    // Evaluate strand completion based on grading rubric
    const evaluateStrand = (strandNum) => {
      const strand = `strand${strandNum}`;
      const inputs = userInputs[strand];
      const input = inputs.level8; // We're only using the level 8 input now
      
      // More sophisticated evaluation logic based on rubric criteria
      let level = 0;
      
      if (input.length < 20) {
        level = 0; // Not enough content
      } else {
        // Research Question (Strand 1)
        if (strandNum === 1) {
          // Basic level check (3-4)
          if (/how.+affect|effect|impact|influence/i.test(input)) {
            level = 4;
            
            // Level 6 check
            if (/(range|between).+(affect|measure|constant|control)/i.test(input)) {
              level = 6;
              
              // Level 8 check - more flexible criteria based on experiment
              if (experimentChoice === 'distance' && 
                  (/magnetic field|inverse square|field lines/i.test(input) && input.length > 150)) {
                level = 8;
              } else if (experimentChoice === 'magnets' && 
                        (/magnetic field|domains|alignment|field addition/i.test(input) && input.length > 150)) {
                level = 8;
              }
            }
          }
        } 
        // Hypothesis (Strand 2)
        else if (strandNum === 2) {
          // Basic level check (3-4)
          if (/(if|when|as).+(then|will)/i.test(input)) {
            level = 4;
            
            // Level 6 check
            if (/(range|between).+(measured|measure|constant|control)/i.test(input)) {
              level = 6;
              
              // Level 8 check - more flexible criteria based on experiment
              if (experimentChoice === 'distance' && 
                  (/inverse square|proportion|field strength|diminish/i.test(input) && 
                  /because|scientific|reason/i.test(input) && 
                  input.length > 200)) {
                level = 8;
              } else if (experimentChoice === 'magnets' && 
                        (/combined|alignment|strength increases|additive/i.test(input) && 
                        /because|scientific|reason/i.test(input) && 
                        input.length > 200)) {
                level = 8;
              }
            }
          }
        }
        // Variables (Strand 3) - Keeping original logic
        else if (strandNum === 3) {
          if (/independent variable|dependent variable/i.test(input)) {
            level = 3;
            
            if (/control variables|method to measure/i.test(input)) {
              level = 4;
            }
            
            if (/range values.+method to measure.+control variables/i.test(input)) {
              level = 6;
            }
            
            if (/(precisely|specifically).+control.+constant.+verify/i.test(input)) {
              level = 8;
            }
          }
        }
        // Methodology (Strand 4) - Keeping original logic
        else if (strandNum === 4) {
          if (/materials|method/i.test(input)) {
            level = 3;
            
            if (/safety|equipment/i.test(input)) {
              level = 4;
            }
            
            if (/steps|logical|trials/i.test(input)) {
              level = 6;
            }
            
            if (/(step-by-step|precautions|quality control|reliability|multiple trials)/i.test(input)) {
              level = 8;
            }
          }
        }
      }
            
      // Update progress
      const newProgress = [...strandProgress];
      newProgress[strandNum - 1] = level;
      setStrandProgress(newProgress);
      
      // Award badges based on strand and level
      if (strandNum === 1 && level >= 8) awardBadge('questionCrafter'); // Changed from level 6 to level 8
      if (strandNum === 2 && level >= 8) awardBadge('curieCommander');
      if (strandNum === 3 && level >= 7) awardBadge('variableVirtuoso');
      if (strandNum === 4 && level >= 7) awardBadge('methodMaster');
      
      // Update strand status
      const newStatus = [...strandStatus];
      newStatus[strandNum - 1] = level >= 3 ? 'completed' : 'in progress';
      setStrandStatus(newStatus);
      
      return level;
    };
  
    // Handle user input changes
    const handleInputChange = (strand, level, value) => {
      setUserInputs(prev => ({
        ...prev,
        [strand]: {
          ...prev[strand],
          [level]: value
        }
      }));

      // Real-time analysis for Strand 1 and Strand 2
      if ((strand === 'strand1' || strand === 'strand2') && level === 'level8') {
        let combinedLevel = 0;
        
        if (strand === 'strand1') {
          // Keyword analysis for specific terms
          const keywordAnalysis = analyzeStrand1(value);
          
          // Concept analysis for broader understanding
          const conceptAnalysis = analyzeConceptsCoverage(value, experimentChoice);
          
          // Combine both approaches - take the higher score
          combinedLevel = Math.max(keywordAnalysis.level, conceptAnalysis.score);
          
          // Update progress in real-time
          const newProgress = [...strandProgress];
          newProgress[0] = combinedLevel;
          setStrandProgress(newProgress);
        } 
        else if (strand === 'strand2') {
          // Keyword analysis for specific terms
          const keywordAnalysis = analyzeStrand2(value, experimentChoice);
          
          // Concept analysis for broader understanding
          const conceptAnalysis = analyzeHypothesisConcepts(value, experimentChoice);
          
          // Combine both approaches - take the higher score
          combinedLevel = Math.max(keywordAnalysis.level, conceptAnalysis.score);
          
          // Update progress in real-time
          const newProgress = [...strandProgress];
          newProgress[1] = combinedLevel;
          setStrandProgress(newProgress);
        }
      }
    };
  
    // Toggle level details visibility
    const toggleLevelDetails = (level) => {
      setShowLevelDetails(prev => ({
        ...prev,
        [level]: !prev[level]
      }));
    };
  
    // Generate PDF as data URL
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  
    // Generate PDF data URL function
    const generatePdfDataUrl = () => {
      setIsPdfGenerating(true);
      
      // Import jsPDF library dynamically
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.async = true;
      
      script.onload = () => {
        try {
          // Create new PDF document
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          
          // Set title and metadata
          const title = `Magnetism Lab Report - ${studentName}`;
          let y = 20; // Starting y position
          
          // Add title
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(title, 105, y, { align: 'center' });
          y += 15;
          
          // Add experiment and student info
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text(`Experiment: ${experimentData[experimentChoice].title}`, 20, y);
          y += 8;
          doc.text(`Student: ${studentName}`, 20, y);
          y += 8;
          doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
          y += 8;
          
          // Add score info
          doc.text(`Total Score: ${strandProgress.reduce((sum, score) => sum + score, 0)}/32`, 20, y);
          y += 8;
          doc.text(`Points Earned: ${points}`, 20, y);
          y += 8;
          doc.text(`Badges Earned: ${Object.values(earnedBadges).filter(Boolean).length}/4`, 20, y);
          y += 15;
          
          // Research Question section
          doc.setFont('helvetica', 'bold');
          doc.text('1. RESEARCH QUESTION', 20, y);
          y += 8;
          doc.setFont('helvetica', 'normal');
          doc.text(`Level: ${strandProgress[0]}/8`, 20, y);
          y += 8;
          doc.text('Content:', 20, y);
          y += 8;
          
          // Split long text into multiple lines
          const splitRQ = doc.splitTextToSize(userInputs.strand1.level8 || "Not completed", 170);
          doc.text(splitRQ, 20, y);
          y += splitRQ.length * 6 + 10;
          
          // Check if we need a new page
          if (y > 260) {
            doc.addPage();
            y = 20;
          }
          
          // Hypothesis section
          doc.setFont('helvetica', 'bold');
          doc.text('2. HYPOTHESIS', 20, y);
          y += 8;
          doc.setFont('helvetica', 'normal');
          doc.text(`Level: ${strandProgress[1]}/8`, 20, y);
          y += 8;
          doc.text('Content:', 20, y);
          y += 8;
          
          const splitHyp = doc.splitTextToSize(userInputs.strand2.level8 || "Not completed", 170);
          doc.text(splitHyp, 20, y);
          y += splitHyp.length * 6 + 10;
          
          // Check if we need a new page
          if (y > 260) {
            doc.addPage();
            y = 20;
          }
          
          // Variables section
          doc.setFont('helvetica', 'bold');
          doc.text('3. VARIABLES', 20, y);
          y += 8;
          doc.setFont('helvetica', 'normal');
          doc.text(`Level: ${strandProgress[2]}/8`, 20, y);
          y += 8;
          doc.text('Content:', 20, y);
          y += 8;
          
          const splitVar = doc.splitTextToSize(userInputs.strand3.level8 || "Not completed", 170);
          doc.text(splitVar, 20, y);
          y += splitVar.length * 6 + 10;
          
          // Check if we need a new page
          if (y > 260) {
            doc.addPage();
            y = 20;
          }
          
          // Methodology section
          doc.setFont('helvetica', 'bold');
          doc.text('4. METHODOLOGY', 20, y);
          y += 8;
          doc.setFont('helvetica', 'normal');
          doc.text(`Level: ${strandProgress[3]}/8`, 20, y);
          y += 8;
          doc.text('Content:', 20, y);
          y += 8;
          
          const splitMeth = doc.splitTextToSize(userInputs.strand4.level8 || "Not completed", 170);
          doc.text(splitMeth, 20, y);
          y += splitMeth.length * 6 + 10;
          
          // Check if we need a new page
          if (y > 260) {
            doc.addPage();
            y = 20;
          }
          
          // Badges section
          doc.setFont('helvetica', 'bold');
          doc.text('BADGES EARNED', 20, y);
          y += 8;
          doc.setFont('helvetica', 'normal');
          doc.text(`Question Crafter: ${earnedBadges.questionCrafter ? "✓" : "✗"}`, 20, y);
          y += 8;
          doc.text(`Curie Commander: ${earnedBadges.curieCommander ? "✓" : "✗"}`, 20, y);
          y += 8;
          doc.text(`Variable Virtuoso: ${earnedBadges.variableVirtuoso ? "✓" : "✗"}`, 20, y);
          y += 8;
          doc.text(`Method Master: ${earnedBadges.methodMaster ? "✓" : "✗"}`, 20, y);
          
          // Generate data URL
          const dataUrl = doc.output('dataurlstring');
          setPdfDataUrl(dataUrl);
          setIsPdfGenerating(false);
        } catch (error) {
          console.error('Error generating PDF:', error);
          setIsPdfGenerating(false);
          alert('There was an error generating the PDF. Please try again.');
        }
      };
      
      script.onerror = () => {
        setIsPdfGenerating(false);
        alert('Failed to load PDF generation library. Please try again later.');
      };
      
      // Add the script to the document
      document.body.appendChild(script);
    };
  
    // Experiment content data
    const experimentData = {
      temperature: {
        title: "Effect of temperature on magnet's strength",
        strand1: {
          level3: "How does the temperature of a magnet affect its magnetic strength?",
          level4: "How does the temperature of a magnet affect its magnetic strength?",
          level6: "How does the temperature of a magnet in the range of 10°C to 70°C affect its magnetic strength, measured indirectly by counting the number of paper clips attracted by the magnet, provided that the size, material and initial strength of the magnet as well as the material and size of the paper clips are kept constant?",
          level8: "How does the temperature of a magnet in the range of 10°C to 70°C affect its magnetic strength, measured indirectly by counting the number of paper clips attracted by the magnet, provided that the size, material and initial strength of the magnet as well as the material and size of the paper clips are kept constant?\n\n• Magnetic Field Strength: The intensity of the magnetic field produced by a magnet, representing the force exerted on magnetic materials.\n• Magnetic Domains: Tiny regions in magnetic materials where atomic magnetic fields align in the same direction. In magnets, domains align to create a strong field.\n• Curie Point: The temperature at which a magnetic material loses its permanent magnetism due to thermal disruption of domain alignment."
        },
        strand2: {
          level3: "If the temperature of the magnet increases, then the strength of the magnet will decrease.",
          level4: "If the temperature of a magnet increases in the range of 10°C to 70°C, then its magnetic strength will decrease. As temperature increases, the atoms vibrate more and weaken the overall magnetic field.",
          level6: "If the temperature of a magnet increases in the range of 10°C to 70°C, then its magnetic strength will decrease, measured indirectly by counting the number of paper clips attracted by the magnet, provided that the size, material and initial strength of the magnet as well as the material and size of the paper clips are kept constant.",
          level8: "If the temperature of a magnet increases in the range of 10°C to 70°C, then its magnetic strength will decrease, measured indirectly by counting the number of paper clips attracted by the magnet, provided that the size, material and initial strength of the magnet as well as the material and size of the paper clips are kept constant.\n\nThis occurs because magnetic materials rely on well-aligned magnetic domains to generate a strong magnetic field. As temperature increases, atoms vibrate more energetically, causing some domains to shift out of alignment. Since 70°C is well below the Curie point (770°C for iron), the loss of magnetism will be measurable but not extreme. This effect is reversible—when cooled back to 10°C, the domains will realign somewhat, restoring some of the lost magnetism."
        },
        strand3: {
          level3: "• Independent Variable: Temperature of the magnet\n• Dependent variable: Strength of the magnet",
          level4: "• Independent variable: Temperature of the magnet. It will be manipulated between the range of 10°C to 70°C by adding magnets to cold water to achieve lower temperatures and hot water to achieve higher temperatures.\n• Dependent variable: Strength of the magnet. Measured by counting the number of paper clips that attach to the magnets at different temperatures.\n• Control variables: Size, material and initial strength of the magnet. Size and material of paper clips.",
          level6: "• Independent variable: Temperature of the magnet. It will be manipulated between the range of 10°C to 70°C. Values selected are 10°C, 30°C, 50°C and 70°C. The magnets will be dipped into cold water to achieve lower temperature and hot water for higher temperatures and its temperature will be measured with a thermometer.\n• Dependent variable: Strength of the magnet. Measured indirectly by counting the number of paper clips that attach to the magnets at different temperatures. There will be three trials for magnets at each temperature.\n• Control variables: Size, material and initial strength of the magnet by using bar magnets of the same batch. Size and material of paper clips by using it from the same box.",
          level8: "• Independent variable:\n  ○ Temperature of the magnet.\n  ○ It will be manipulated between the range of 10°C to 70°C.\n  ○ Values selected are 10°C, 30°C, 50°C and 70°C.\n  ○ The magnets will be dipped into ice cold water. A thermometer will be placed in the water and the magnet will be pulled out once it reaches the temperature of 10°C.\n  ○ The magnets will be dipped into water at 100°C. A thermometer will be placed in the water and the magnet will be pulled out once it reaches the temperature of 30°C, 50°C and 70°C.\n  ○ The time between a magnet being pulled out and being brought closer to pins should be very small so that the magnet does not change its temperature.\n\n• Dependent variable:\n  ○ Strength of the magnet.\n  ○ The magnet, once it achieves the desired temperature, will be brought closer to a paper clip. Once this attaches to the magnet then another paper clip will be brought closer to the first one and thus a line of paper clips will be formed.\n  ○ Measured indirectly by counting the number of paper clips that attach to the magnets at different temperatures.\n  ○ If the strength of the magnet is greater, then it will attract more paper clips and thus the strength of the magnet will be determined.\n  ○ There will be three trials for the magnets at different temperatures.\n\n• Control variables:\n  ○ Bar magnets of the same size and material will be used for the experiment.\n  ○ The initial strength of the bar magnet can be tested by checking how many paper clips it can attract and magnets with the same strength will be selected for the experiment.\n  ○ Paper clips will be from the same box which will ensure same material and size.\n  ○ Temperature of the room will be controlled using the thermostat at the same temperature and confirmed using a thermometer."
        },
        strand4: {
          level3: "Materials needed:\n• Bar magnets\n• Paper clips\n• Thermometer\n• Hot and cold water\n• Beakers\n• Tongs",
          level4: "Materials:\n• Bar magnets (same size, same material, and same initial strength)\n• Paper clips (from the same box to ensure uniform size and material)\n• Thermometer (to measure the magnet's temperature accurately)\n• Hot water bath (for heating the magnet to 30°C, 50°C, and 70°C)\n• Ice water bath (for cooling the magnet to 10°C)\n• Beakers (500 mL or more) (for holding hot and cold water)\n• Tongs or heat-resistant gloves (to handle hot magnets safely)\n\nSafety considerations:\n• Use tongs when handling hot magnets\n• Place beakers on stable surfaces\n• Watch for hot water burns",
          level6: "Materials:\n• Bar magnets (same size, same material, and same initial strength)\n• Paper clips (from the same box to ensure uniform size and material)\n• Thermometer (to measure the magnet's temperature accurately)\n• Hot water bath (for heating the magnet to 30°C, 50°C, and 70°C)\n• Ice water bath (for cooling the magnet to 10°C)\n• Beakers (500 mL or more) (for holding hot and cold water)\n• Tongs or heat-resistant gloves (to handle hot magnets safely)\n\nSafety hazards and precautions:\n• Risk of Burns from Hot Water and Heated Magnet\n  ○ Hazard: The water used to heat the magnet (especially at 70°C) can cause burns, and the magnet itself can retain heat.\n  ○ Precaution: Use tongs or heat-resistant gloves when handling hot magnets. Ensure the beaker with hot water is placed on a stable surface to avoid spills.\n• Risk of Glass Breakage and Spillage\n  ○ Hazard: Sudden temperature changes (e.g., placing a hot beaker on a cold surface) can cause glass beakers to crack or break. Spilled water can create a slipping hazard.\n  ○ Precaution: Use borosilicate glass beakers (heat-resistant). Place beakers on heat proof mats and handle them carefully. Immediately clean up any spills to prevent slipping accidents.",
          level8: "Set-Up of the Experiment:\n• Gather all materials and equipment, ensuring that the magnets are of the same size, material, and initial strength by pre-testing how many paper clips they can attract at room temperature.\n• Set the room temperature using a thermostat and confirm with a thermometer to maintain consistency.\n• Prepare two water baths:\n  ○ Ice water bath (10°C) – Fill a beaker with ice water and use a thermometer to monitor the temperature.\n  ○ Hot water bath (set to 70°C) – Fill another beaker with water and heat it using a controlled heat source. Adjust until the thermometer reads 70°C.\n\nMeasuring Magnetic Strength at 10°C (Ice Water Bath):\n1. Place the first magnet in the ice water bath.\n2. Use a thermometer to check when the magnet's temperature reaches 10°C.\n3. Quickly remove the magnet using tongs and immediately bring it close to a paper clip.\n4. Once the first paper clip is attached, bring another paper clip close to the first one and observe how many paper clips form a chain.\n5. Record the number of paper clips attracted.\n6. Repeat steps 1 to 5 for three trials and calculate the average number of paper clips attracted.\n\nMeasuring Magnetic Strength at 30°C, 50°C, and 70°C (Hot Water Bath):\n7. Place the second magnet in a hot water bath.\n8. Use a thermometer to check when the magnet's temperature reaches 30°C.\n9. Quickly remove the magnet using tongs and repeat steps 4-6 (test and record paper clip attraction).\n10. Repeat steps 7, 8 and 9 for 50°C and 70°C.\n\nSafety hazards and precautions:\n• Risk of Burns from Hot Water and Heated Magnet\n  ○ Hazard: The water used to heat the magnet (especially at 70°C) can cause burns, and the magnet itself can retain heat.\n  ○ Precaution: Use tongs or heat-resistant gloves when handling hot magnets. Ensure the beaker with hot water is placed on a stable surface to avoid spills.\n• Risk of Glass Breakage and Spillage\n  ○ Hazard: Sudden temperature changes can cause glass beakers to crack or break. Spilled water can create a slipping hazard.\n  ○ Precaution: Use borosilicate glass beakers. Place beakers on heat proof mats and handle them carefully. Immediately clean up any spills."
        }
      },
      distance: {
        title: "Effect of distance on magnet's strength",
        strand1: {
          level3: "How does the distance from a magnet affect its magnetic field strength?",
          level4: "How does the distance from a magnet affect its magnetic field strength?",
          level6: "How does the distance from a magnet in the range of 1 cm to 10 cm affect its magnetic field strength, measured by counting the number of paper clips attracted, while keeping the magnet type, size, and orientation constant?",
          level8: "How does the distance from a magnet in the range of 1 cm to 10 cm affect its magnetic field strength, measured by counting the number of paper clips attracted, while keeping the magnet type, size, and orientation constant?\n\n• Magnetic Field Strength: The intensity of the magnetic field produced by a magnet that follows the inverse square law, where field strength is inversely proportional to the square of the distance.\n• Inverse Square Law: The physical law stating that the effect of a point source (like a magnetic field) decreases proportionally to the square of the distance from the source.\n• Magnetic Field Lines: Imaginary lines that map the direction and strength of a magnetic field, showing how they spread out in three dimensions from the poles of a magnet."
        },
        strand2: {
          level3: "If the distance from the magnet increases, then the magnetic field strength will decrease.",
          level4: "If the distance from the magnet increases in the range of 1 cm to 10 cm, then the magnetic field strength will decrease. This happens because magnetic field strength weakens with increased distance from the source.",
          level6: "If the distance from the magnet increases in the range of 1 cm to 10 cm, then its magnetic field strength will decrease, as measured by counting the number of paper clips attracted, while keeping the magnet type, size, and orientation constant. This follows the principle that magnetic field strength diminishes with distance.",
          level8: "If the distance from the magnet increases in the range of 1 cm to 10 cm, then its magnetic field strength will decrease according to the inverse square law, as measured by counting the number of paper clips attracted, while keeping the magnet type, size, and orientation constant.\n\nThis occurs because magnetic field lines spread out in three dimensions from the magnet, causing the field strength to decrease proportionally to 1/r², where r is the distance from the magnet. At greater distances, the magnetic field becomes too weak to overcome the weight and friction of the paper clips, resulting in fewer clips being attracted. This relationship is consistent with Coulomb's law for magnetic poles, which states that the force between magnetic poles varies inversely with the square of the distance between them."
        },
        strand3: {
          level3: "• Independent Variable: Distance from the magnet\n• Dependent variable: Strength of the magnetic field",
          level4: "• Independent variable: Distance from the magnet. It will be varied from 1 cm to 10 cm using a ruler to measure the distance accurately.\n• Dependent variable: Strength of the magnetic field. Measured by counting the number of paper clips that the magnet can attract at different distances.\n• Control variables: Type of magnet, size of magnet, orientation of magnet, size and material of paper clips.",
          level6: "• Independent variable: Distance from the magnet. It will be varied between the range of 1 cm to 10 cm. Values selected are 1 cm, 3 cm, 5 cm, 7 cm, and 10 cm. A ruler will be used to measure the distances accurately.\n• Dependent variable: Strength of the magnetic field. Measured by counting the number of paper clips that the magnet can attract at different distances. There will be three trials at each distance measurement.\n• Control variables: Type of magnet (same bar magnet will be used), size of magnet, orientation of magnet (the same pole will face the paper clips), size and material of paper clips (from the same box).",
          level8: "• Independent variable:\n  ○ Distance from the magnet.\n  ○ It will be varied between the range of 1 cm to 10 cm.\n  ○ Values selected are 1 cm, 3 cm, 5 cm, 7 cm, and 10 cm.\n  ○ A meter ruler fixed to the table will be used to measure the distances accurately.\n  ○ The magnet will be held in a fixed position, and the paper clips will be placed at the specified distances.\n  ○ Distance will be measured from the pole of the magnet to the nearest end of the paper clip.\n\n• Dependent variable:\n  ○ Strength of the magnetic field.\n  ○ Measured by counting the number of paper clips that the magnet can attract at different distances.\n  ○ A paper clip will be considered 'attracted' when it moves toward the magnet without direct physical contact.\n  ○ A digital camera will record the interaction to verify exact moment of attraction.\n  ○ There will be three trials at each distance measurement.\n  ○ The average number of paper clips attracted at each distance will be calculated.\n\n• Control variables:\n  ○ Type of magnet: The same bar magnet will be used throughout the experiment.\n  ○ Size and material of magnet: Using a standard 7 cm ceramic bar magnet.\n  ○ Orientation of magnet: The north pole will face the paper clips in all trials.\n  ○ Paper clips: Standard stainless steel paper clips from the same box will be used (28 mm length).\n  ○ Environmental factors: The experiment will be conducted in a room with constant temperature and away from other magnetic fields or metal objects.\n  ○ Position of paper clips: Paper clips will be arranged in the same initial configuration for each trial."
        },
        strand4: {
          level3: "Materials needed:\n• Bar magnet\n• Paper clips\n• Ruler\n• Non-magnetic surface\n• Paper for recording results",
          level4: "Materials:\n• Bar magnet (ceramic or alnico)\n• Paper clips (standard size, stainless steel)\n• Meter ruler (with millimeter markings)\n• Non-magnetic platform (wooden or plastic table)\n• Recording sheet\n• Pencil\n\nSafety considerations:\n• Keep magnets away from electronic devices\n• Handle magnets carefully to avoid pinching fingers\n• Keep small metal objects away from work area",
          level6: "Materials:\n• Bar magnet (ceramic or alnico, 7 cm length)\n• Paper clips (28 mm, stainless steel, from the same manufacturer)\n• Meter ruler (with millimeter markings)\n• Non-magnetic platform (wooden table)\n• Graph paper for precise placement\n• Recording sheet with prepared tables\n• Digital camera for documentation\n\nSafety hazards and precautions:\n• Risk of Injury from Magnet Attraction\n  ○ Hazard: Strong magnets can attract suddenly, pinching fingers or causing impact injuries.\n  ○ Precaution: Handle magnets with care, keeping fingers clear of the path between magnets and ferromagnetic objects.\n• Risk to Electronic Devices\n  ○ Hazard: Magnetic fields can damage electronic devices and magnetic storage media.\n  ○ Precaution: Keep all electronic devices, credit cards, and magnetic media at least 30 cm away from the experimental area.",
          level8: "Set-Up of the Experiment:\n• Select a wooden table in a location free from magnetic interference and electronic devices.\n• Tape a meter ruler to the table surface to provide accurate distance measurements.\n• Mark positions at 1 cm, 3 cm, 5 cm, 7 cm, and 10 cm on a sheet of graph paper placed over the ruler.\n• Secure the bar magnet at one end of the ruler using non-magnetic tape, ensuring the north pole faces along the ruler's length.\n• Prepare a recording table with columns for distance, trial number, number of paper clips attracted, and average per distance.\n\nProcedure:\n1. Verify that the experimental area is free from magnetic interference by testing with a compass.\n2. Place the bar magnet at the zero mark of the ruler, with its north pole facing along the length of the ruler.\n3. Place a paper clip at the 1 cm mark and observe if it moves toward the magnet.\n4. If attracted, place another paper clip at the same distance and continue until a paper clip is no longer attracted.\n5. Record the number of paper clips attracted at the 1 cm distance.\n6. Repeat steps 3-5 for two more trials at the 1 cm distance.\n7. Calculate the average number of paper clips attracted at the 1 cm distance.\n8. Repeat steps 3-7 for the distances of 3 cm, 5 cm, 7 cm, and 10 cm.\n9. Create a graph showing the relationship between distance and number of paper clips attracted.\n\nSafety hazards and precautions:\n• Risk of Injury from Magnet Attraction\n  ○ Hazard: Strong magnets can attract suddenly, pinching fingers or causing impact injuries.\n  ○ Precaution: Handle magnets with care, keeping fingers clear of the path between magnets and ferromagnetic objects.\n• Risk to Electronic Devices\n  ○ Hazard: Magnetic fields can damage electronic devices and magnetic storage media.\n  ○ Precaution: Keep all electronic devices, credit cards, and magnetic media at least 30 cm away from the experimental area."
        }
      },
      magnets: {
        title: "Effect of number of magnets on strength",
        strand1: {
          level3: "How does the number of magnets affect the magnetic field strength?",
          level4: "How does the number of magnets affect the magnetic field strength?",
          level6: "How does the number of magnets in the range of 1 to 5 magnets affect the magnetic field strength, measured by counting the number of paper clips attracted, while keeping the magnet type, size, arrangement, and distance constant?",
          level8: "How does the number of magnets in the range of 1 to 5 magnets arranged in a stack affect the magnetic field strength, measured by counting the number of paper clips attracted, while keeping the magnet type, size, arrangement, and distance constant?\n\n• Magnetic Field Addition: When multiple magnets are aligned with like poles facing the same direction, their magnetic fields add constructively, creating a stronger combined magnetic field.\n• Magnetic Domains: Regions within ferromagnetic materials where magnetic moments align. Multiple aligned magnets create a larger volume of aligned domains, resulting in a stronger magnetic field.\n• Magnetic Saturation: The phenomenon where adding more magnets eventually leads to diminishing returns in field strength increases, as the material being attracted approaches its maximum possible magnetization."
        },
        strand2: {
          level3: "If the number of magnets increases, then the magnetic field strength will increase.",
          level4: "If the number of magnets increases in the range of 1 to 5 magnets, then the magnetic field strength will increase. This happens because the magnetic fields from multiple magnets combine to create a stronger overall field.",
          level6: "If the number of magnets increases in the range of 1 to 5 magnets, then the magnetic field strength will increase, as measured by counting the number of paper clips attracted, while keeping the magnet type, size, arrangement, and distance constant. This follows the principle that aligned magnetic fields add constructively.",
          level8: "If the number of magnets increases in the range of 1 to 5 magnets arranged in a stack with like poles facing the same direction, then the magnetic field strength will increase proportionally, as measured by counting the number of paper clips attracted, while keeping the magnet type, size, arrangement, and distance constant.\n\nThis occurs because the aligned magnetic domains from each additional magnet contribute to the overall magnetic field, causing a cumulative effect that strengthens the magnetic field at the poles. When the north poles of multiple magnets are aligned in the same direction, the magnetic field lines combine additively, leading to a stronger net magnetic field. This follows from the principle of superposition of magnetic fields, where the total field strength is the vector sum of individual field strengths. However, the relationship may not be perfectly linear due to small variations in individual magnet strengths and the complexity of three-dimensional field interactions."
        },
        strand3: {
          level3: "• Independent Variable: Number of magnets\n• Dependent variable: Strength of the magnetic field",
          level4: "• Independent variable: Number of magnets. It will be varied from 1 to 5 magnets stacked together with like poles aligned.\n• Dependent variable: Strength of the magnetic field. Measured by counting the number of paper clips that the magnets can attract.\n• Control variables: Type of magnets, size of magnets, arrangement of magnets, distance to paper clips, size and material of paper clips.",
          level6: "• Independent variable: Number of magnets. It will be varied between the range of 1 to 5 magnets. Values selected are 1, 2, 3, 4, and 5 magnets. The magnets will be stacked together with north poles aligned in the same direction.\n• Dependent variable: Strength of the magnetic field. Measured by counting the number of paper clips that the stack of magnets can attract. There will be three trials for each number of magnets.\n• Control variables: Type of magnets (same bar magnets will be used), size of magnets (all same dimensions), arrangement of magnets (stacked with like poles facing same direction), distance to paper clips (constant 1 cm), size and material of paper clips (from same box).",
          level8: "• Independent variable:\n  ○ Number of magnets.\n  ○ It will be varied between the range of 1 to 5 magnets.\n  ○ Values selected are 1, 2, 3, 4, and 5 magnets.\n  ○ The magnets will be stacked together with north poles aligned in the same direction.\n  ○ Each magnet will be tested individually first to ensure similar initial strengths.\n  ○ Magnets will be stacked using a non-magnetic holding device to ensure consistent alignment.\n\n• Dependent variable:\n  ○ Strength of the magnetic field.\n  ○ Measured by counting the number of paper clips that the stack of magnets can attract.\n  ○ Paper clips will be arranged in a chain, with the first clip placed at a constant distance of 1 cm from the stack's north pole.\n  ○ The maximum number of paper clips in the chain before detachment will be recorded.\n  ○ There will be three trials for each number of magnets.\n  ○ The average number of paper clips attracted for each configuration will be calculated.\n\n• Control variables:\n  ○ Type of magnets: Identical ceramic bar magnets from the same manufacturing batch.\n  ○ Size of magnets: All magnets will have the same dimensions (5 cm × 1.5 cm × 0.5 cm).\n  ○ Arrangement of magnets: Stacked with north poles aligned in the same direction using a plastic alignment guide.\n  ○ Distance to paper clips: The first paper clip will always be placed exactly 1 cm from the end of the magnet stack, measured with a plastic ruler.\n  ○ Paper clips: Standard stainless steel paper clips from the same box will be used (28 mm length).\n  ○ Environmental factors: The experiment will be conducted on a wooden table away from other magnetic sources and at constant room temperature."
        },
        strand4: {
          level3: "Materials needed:\n• Bar magnets (5 identical ones)\n• Paper clips\n• Ruler\n• Non-magnetic surface\n• Paper for recording results",
          level4: "Materials:\n• Bar magnets (5 identical ceramic or alnico magnets)\n• Paper clips (standard size, stainless steel)\n• Ruler (with millimeter markings)\n• Non-magnetic platform (wooden or plastic table)\n• Recording sheet\n• Pencil\n\nSafety considerations:\n• Keep magnets away from electronic devices\n• Handle magnets carefully to avoid pinching fingers\n• Keep magnets separated when not testing to prevent accidental attraction",
          level6: "Materials:\n• Bar magnets (5 identical ceramic magnets, same size and strength)\n• Paper clips (28 mm, stainless steel, from the same manufacturer)\n• Ruler (with millimeter markings)\n• Non-magnetic platform (wooden table)\n• Plastic alignment guide for stacking magnets\n• Recording sheet with prepared tables\n\nSafety hazards and precautions:\n• Risk of Injury from Magnet Attraction\n  ○ Hazard: Strong magnets can attract suddenly, pinching fingers or causing impact injuries when stacking.\n  ○ Precaution: Handle magnets with care, keeping fingers clear of the path between magnets.\n• Risk to Electronic Devices\n  ○ Hazard: Multiple magnets create stronger magnetic fields that can damage electronic devices.\n  ○ Precaution: Keep all electronic devices, credit cards, and magnetic media at least 50 cm away from the experimental area.",
          level8: "Set-Up of the Experiment:\n• Select a wooden table in a location free from magnetic interference and electronic devices.\n• Test each individual magnet with paper clips to ensure they have similar strengths.\n• Create a plastic alignment guide to ensure magnets are stacked with north poles aligned consistently.\n• Set up a fixed measuring device to maintain a constant 1 cm distance between the magnet stack and the first paper clip.\n• Prepare a recording table with columns for number of magnets, trial number, number of paper clips attracted, and average.\n\nProcedure:\n1. Place one magnet in the alignment guide with its north pole facing outward.\n2. Position the first paper clip exactly 1 cm from the north pole of the magnet.\n3. If the paper clip is attracted, bring a second paper clip close to the first one and continue until no more paper clips can be added to the chain.\n4. Record the number of paper clips in the chain.\n5. Repeat steps 2-4 for two more trials with one magnet.\n6. Calculate the average number of paper clips attracted with one magnet.\n7. Stack a second identical magnet behind the first one, with north poles aligned in the same direction.\n8. Repeat steps 2-6 with two magnets.\n9. Continue the process, adding one magnet at a time to the stack until reaching five magnets.\n10. Create a graph showing the relationship between the number of magnets and the number of paper clips attracted.\n\nSafety hazards and precautions:\n• Risk of Injury from Magnet Attraction\n  ○ Hazard: Strong magnets can attract suddenly, pinching fingers or causing impact injuries.\n  ○ Precaution: Use the plastic alignment guide for stacking, keeping fingers away from between magnets.\n• Risk to Electronic Devices\n  ○ Hazard: Multiple stacked magnets create a very strong magnetic field that can damage electronics.\n  ○ Precaution: Keep all electronic devices, credit cards, and magnetic media at least 50 cm away from the experimental area.\n• Risk of Magnets Breaking\n  ○ Hazard: Ceramic magnets can break if allowed to snap together uncontrolled.\n  ○ Precaution: Always control the attraction between magnets by sliding them together horizontally rather than allowing them to attract from a distance."
        }
      }
    };
  
    // Render welcome screen
    if (screen === 'welcome') {
      return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-blue-50">
          <header className="bg-blue-600 text-white p-4 shadow-md">
            <h1 className="text-2xl font-bold text-center">Scientific Lab Report Guide: MYP Criteria B</h1>
            <p className="text-center">Learn how to write an excellent lab report step by step</p>
          </header>
          
          <main className="flex-grow flex flex-col items-center justify-center p-6 max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full">
              <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">🧲 Magnetism Lab Explorer 🧪</h2>
              
              <div className="mb-8">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input 
                  type="text" 
                  id="name" 
                  value={studentName} 
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Estimated Completion Time: 40 minutes ⏱️</h3>
                <p className="text-gray-600">
                  In this activity, you'll explore how to write a complete lab report section for MYP Criteria B. 
                  You'll learn about research questions, hypotheses, variables, and methodology.
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Available Badges</h3>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                    <span className="text-xl">🎯</span>
                    <div>
                      <p className="font-medium text-gray-800">Curie Commander</p>
                      <p className="text-sm text-gray-600">Level 8 Hypothesis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                    <span className="text-xl">🧲</span>
                    <div>
                      <p className="font-medium text-gray-800">Variable Virtuoso</p>
                      <p className="text-sm text-gray-600">Fully controlled CVs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                    <span className="text-xl">🧪</span>
                    <div>
                      <p className="font-medium text-gray-800">Method Master</p>
                      <p className="text-sm text-gray-600">Logical + safe procedure</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                    <span className="text-xl">🧠</span>
                    <div>
                      <p className="font-medium text-gray-800">Question Crafter</p>
                      <p className="text-sm text-gray-600">Perfect research question</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Choose Your Experiment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <button 
                    onClick={() => setExperimentChoice('distance')} 
                    className={`p-4 border rounded text-left ${experimentChoice === 'distance' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <p className="font-medium">Distance's Effect on Magnetic Strength</p>
                    <p className="text-sm text-gray-600">How does distance affect a magnet's strength?</p>
                  </button>
                  <button 
                    onClick={() => setExperimentChoice('magnets')} 
                    className={`p-4 border rounded text-left ${experimentChoice === 'magnets' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <p className="font-medium">Multiple Magnets' Effect on Strength</p>
                    <p className="text-sm text-gray-600">How does using multiple magnets affect magnetic strength?</p>
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  if (studentName && experimentChoice) {
                    setScreen('main');
                  }
                }}
                disabled={!studentName || !experimentChoice}
                className={`w-full py-3 rounded-lg shadow-md transition ${studentName && experimentChoice ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Start Journey
              </button>
            </div>
          </main>
        </div>
      );
    }
  
    // Render results screen
    if (screen === 'results') {
      const totalScore = strandProgress.reduce((sum, score) => sum + score, 0);
      const totalBadges = Object.values(earnedBadges).filter(Boolean).length;
      
      return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-blue-50">
          <header className="bg-blue-600 text-white p-4 shadow-md">
            <h1 className="text-2xl font-bold text-center">Your Lab Report Results</h1>
          </header>
          
          <main className="flex-grow p-6 max-w-4xl mx-auto w-full">
            <div className="bg-white p-8 rounded-lg shadow-lg mb-6">
              <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
                Congratulations, {studentName}!
              </h2>
              
              <div className="mb-8 text-center">
                <p className="text-lg">You completed the {experimentData[experimentChoice].title} investigation</p>
                <div className="mt-4 flex justify-center items-center gap-4">
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">Total Score</p>
                    <p className="text-3xl font-bold text-blue-800">{totalScore}</p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">Points Earned</p>
                    <p className="text-3xl font-bold text-blue-800">{points}</p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">Badges Earned</p>
                    <p className="text-3xl font-bold text-blue-800">{totalBadges}/4</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Strand Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Research Question</h4>
                      <span className="text-lg font-bold">Level {strandProgress[0]}</span>
                    </div>
                    <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${(strandProgress[0] / 8) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Hypothesis</h4>
                      <span className="text-lg font-bold">Level {strandProgress[1]}</span>
                    </div>
                    <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${(strandProgress[1] / 8) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Variables</h4>
                      <span className="text-lg font-bold">Level {strandProgress[2]}</span>
                    </div>
                    <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${(strandProgress[2] / 8) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Methodology</h4>
                      <span className="text-lg font-bold">Level {strandProgress[3]}</span>
                    </div>
                    <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${(strandProgress[3] / 8) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Badges Earned</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`border rounded-lg p-4 text-center ${earnedBadges.questionCrafter ? 'border-green-500 bg-green-50' : 'border-gray-200 opacity-50'}`}>
                    <span className="text-3xl">🧠</span>
                    <p className="font-medium mt-2">Question Crafter</p>
                  </div>
                  <div className={`border rounded-lg p-4 text-center ${earnedBadges.curieCommander ? 'border-green-500 bg-green-50' : 'border-gray-200 opacity-50'}`}>
                    <span className="text-3xl">🎯</span>
                    <p className="font-medium mt-2">Curie Commander</p>
                  </div>
                  <div className={`border rounded-lg p-4 text-center ${earnedBadges.variableVirtuoso ? 'border-green-500 bg-green-50' : 'border-gray-200 opacity-50'}`}>
                    <span className="text-3xl">🧲</span>
                    <p className="font-medium mt-2">Variable Virtuoso</p>
                  </div>
                  <div className={`border rounded-lg p-4 text-center ${earnedBadges.methodMaster ? 'border-green-500 bg-green-50' : 'border-gray-200 opacity-50'}`}>
                    <span className="text-3xl">🧪</span>
                    <p className="font-medium mt-2">Method Master</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Your Lab Report Responses</h3>
                
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-2">Research Question</h4>
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border">
                      {userInputs.strand1.level8 || "Not provided"}
                    </pre>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-2">Hypothesis</h4>
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border">
                      {userInputs.strand2.level8 || "Not provided"}
                    </pre>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-2">Variables</h4>
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border">
                      {userInputs.strand3.level8 || "Not provided"}
                    </pre>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-2">Methodology</h4>
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border">
                      {userInputs.strand4.level8 || "Not provided"}
                    </pre>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    setScreen('welcome');
                    setStudentName('');
                    setExperimentChoice(null);
                    setCurrentStrand(1);
                    setStrandProgress([0, 0, 0, 0]);
                    setUserInputs({
                      strand1: { level3: '', level4: '', level6: '', level8: '' },
                      strand2: { level3: '', level4: '', level6: '', level8: '' },
                      strand3: { level3: '', level4: '', level6: '', level8: '' },
                      strand4: { level3: '', level4: '', level6: '', level8: '' }
                    });
                    setEarnedBadges({
                      questionCrafter: false,
                      curieCommander: false,
                      variableVirtuoso: false,
                      methodMaster: false
                    });
                    setPoints(0);
                    setStrandStatus(['in progress', 'not started', 'not started', 'not started']);
                  }}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Try Different Experiment
                </button>
                
                {pdfDataUrl ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <h4 className="font-medium text-green-800 mb-3">Your PDF is ready!</h4>
                    <p className="text-green-700 mb-4">Click the link below to open your PDF in a new tab. From there, you can download it by clicking the download button in your browser.</p>
                    <a 
                      href={pdfDataUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center font-medium"
                    >
                      View & Download PDF
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={generatePdfDataUrl}
                    disabled={isPdfGenerating}
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                  >
                    {isPdfGenerating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                        </svg>
                        Generate PDF Report
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>
      );
    }
  
    // Render main application screen
   // Render main application screen
return (
  <div className="flex flex-col min-h-screen bg-gray-50">
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">Scientific Lab Report Guide: MYP Criteria B</h1>
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <span className="font-bold">{points} POINTS</span>
        </div>
      </div>
    </header>
    
    {/* Badge Animation */}
    {showBadgeAnimation && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-xl transform animate-bounce text-center">
          <div className="text-6xl mb-4">
            {showBadgeAnimation === 'questionCrafter' && '🧠'}
            {showBadgeAnimation === 'curieCommander' && '🎯'}
            {showBadgeAnimation === 'variableVirtuoso' && '🧲'}
            {showBadgeAnimation === 'methodMaster' && '🧪'}
          </div>
          <h3 className="text-xl font-bold text-blue-800 mb-2">
            {showBadgeAnimation === 'questionCrafter' && 'Question Crafter'}
            {showBadgeAnimation === 'curieCommander' && 'Curie Commander'}
            {showBadgeAnimation === 'variableVirtuoso' && 'Variable Virtuoso'}
            {showBadgeAnimation === 'methodMaster' && 'Method Master'}
          </h3>
          <p className="text-gray-600">Badge Earned! +25 points</p>
        </div>
      </div>
    )}
    
    <div className="max-w-6xl mx-auto w-full flex-grow flex flex-col mt-4 px-4 gap-4">
      {/* Horizontal Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col space-y-6">
          {/* Horizontal Strand Navigation */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Lab Report Progress</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Experiment: </span>
              <span className="font-medium">{experimentData[experimentChoice].title}</span>
            </div>
          </div>
          
          <div className="flex justify-between gap-4">
            {[1, 2, 3, 4].map((strand) => (
              <button 
                key={strand}
                onClick={() => setCurrentStrand(strand)}
                className={`flex-1 p-3 rounded-lg flex flex-col items-center justify-center ${currentStrand === strand ? 'bg-blue-100 text-blue-800 border-2 border-blue-500' : 'hover:bg-gray-100 border border-gray-200'}`}
              >
                <span className="text-xl mb-1">
                  {strandStatus[strand-1] === 'completed' ? '✅' : strandStatus[strand-1] === 'in progress' ? '📝' : '📋'}
                </span>
                <span className="font-medium">
                  {strand === 1 ? 'Research Question' : 
                   strand === 2 ? 'Hypothesis' : 
                   strand === 3 ? 'Variables' : 'Methodology'}
                </span>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-blue-600 h-full"
                    style={{ width: `${(strandProgress[strand-1] / 8) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium mt-1">{strandProgress[strand-1]}/8</span>
              </button>
            ))}
          </div>
          
          {/* Horizontal Badges */}
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className={`p-3 border rounded-lg flex flex-col items-center ${earnedBadges.questionCrafter ? 'border-green-500 bg-green-50' : 'border-gray-200 opacity-70'}`}>
                <span className="text-xl">🧠</span>
                <span className="text-xs mt-1">Question Crafter</span>
              </div>
              <div className={`p-3 border rounded-lg flex flex-col items-center ${earnedBadges.curieCommander ? 'border-green-500 bg-green-50' : 'border-gray-200 opacity-70'}`}>
                <span className="text-xl">🎯</span>
                <span className="text-xs mt-1">Curie Commander</span>
              </div>
              <div className={`p-3 border rounded-lg flex flex-col items-center ${earnedBadges.variableVirtuoso ? 'border-green-500 bg-green-50' : 'border-gray-200 opacity-70'}`}>
                <span className="text-xl">🧲</span>
                <span className="text-xs mt-1">Variable Virtuoso</span>
              </div>
              <div className={`p-3 border rounded-lg flex flex-col items-center ${earnedBadges.methodMaster ? 'border-green-500 bg-green-50' : 'border-gray-200 opacity-70'}`}>
                <span className="text-xl">🧪</span>
                <span className="text-xs mt-1">Method Master</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-blue-100 p-2 rounded-lg">
              <span className="text-xl">🏆</span>
              <div>
                <span className="text-xs text-blue-800">POINTS</span>
                <p className="font-bold text-blue-800">{points}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-grow bg-white rounded-lg shadow-md p-6">
        <div className="border-b pb-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {currentStrand === 1 && 'Research Question'}
              {currentStrand === 2 && 'Hypothesis'}
              {currentStrand === 3 && 'Variables'}
              {currentStrand === 4 && 'Methodology'}
            </h2>
          </div>
          <p className="text-gray-600 mt-1">
            {currentStrand === 1 && 'A good research question clearly identifies the independent and dependent variables, how they will be measured, and what relationship you\'re investigating.'}
            {currentStrand === 2 && 'A good hypothesis predicts the relationship between your variables and explains why you expect this relationship based on scientific principles.'}
            {currentStrand === 3 && 'Clearly identifying variables ensures your experiment is valid and reliable. This includes describing how you\'ll manipulate and measure variables.'}
            {currentStrand === 4 && 'A strong methodology outlines all materials, safety precautions, and logical step-by-step procedures to answer your research question.'}
          </p>
        </div>
        
        <div className="mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setCurrentTab('guided')}
              className={`py-2 px-4 font-medium ${currentTab === 'guided' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Guided Example
            </button>
            <button
              onClick={() => setCurrentTab('your')}
              className={`py-2 px-4 font-medium ${currentTab === 'your' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Your Experiment
            </button>
          </div>
        </div>
        
        {/* Guided Example Tab */}
        {currentTab === 'guided' && (
          <div>
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-4 flex items-center">
                <span className="text-xl mr-2">📝</span>
                {currentStrand === 1 && 'Research Question - Temperature Experiment (Example)'}
                {currentStrand === 2 && 'Hypothesis - Temperature Experiment (Example)'}
                {currentStrand === 3 && 'Variables - Temperature Experiment (Example)'}
                {currentStrand === 4 && 'Methodology - Temperature Experiment (Example)'}
              </h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleLevelDetails('level3')}
                    className="w-full flex justify-between items-center p-3 bg-gray-50 text-left"
                  >
                    <span className="font-medium">Level 3-4: Basic {currentStrand === 1 ? 'Research Question' : currentStrand === 2 ? 'Hypothesis' : currentStrand === 3 ? 'Variables' : 'Methodology'}</span>
                    <span>{showLevelDetails.level3 ? '🔽' : '▶️'}</span>
                  </button>
                  {showLevelDetails.level3 && (
                    <div className="p-4 bg-white">
                      <div className="mb-2 text-sm text-blue-800 font-medium">
                        Key characteristics: Identifies main variables and their relationship
                      </div>
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border">
                        {experimentData['temperature'][`strand${currentStrand}`].level4}
                      </pre>
                    </div>
                  )}
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleLevelDetails('level6')}
                    className="w-full flex justify-between items-center p-3 bg-gray-50 text-left"
                  >
                    <span className="font-medium">Level 6: Detailed {currentStrand === 1 ? 'Research Question' : currentStrand === 2 ? 'Hypothesis' : currentStrand === 3 ? 'Variables' : 'Methodology'}</span>
                    <span>{showLevelDetails.level6 ? '🔽' : '▶️'}</span>
                  </button>
                  {showLevelDetails.level6 && (
                    <div className="p-4 bg-white">
                      <div className="mb-2 text-sm text-blue-800 font-medium">
                        Improvement from Level 4: {currentStrand === 1 ? 'Addition of specific ranges, measurement methods, and control variables' : 
                                                  currentStrand === 2 ? 'Inclusion of range values, measurement method, and control variables' : 
                                                  currentStrand === 3 ? 'Specific range values for IV, methods to measure DV, and named control variables' : 
                                                  'Logical method with clear steps and multiple trials'}
                      </div>
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border">
                        {experimentData['temperature'][`strand${currentStrand}`].level6}
                      </pre>
                    </div>
                  )}
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleLevelDetails('level8')}
                    className="w-full flex justify-between items-center p-3 bg-gray-50 text-left"
                  >
                    <span className="font-medium">Level 8: Comprehensive {currentStrand === 1 ? 'Research Question' : currentStrand === 2 ? 'Hypothesis' : currentStrand === 3 ? 'Variables' : 'Methodology'}</span>
                    <span>{showLevelDetails.level8 ? '🔽' : '▶️'}</span>
                  </button>
                  {showLevelDetails.level8 && (
                    <div className="p-4 bg-white">
                      <div className="mb-2 text-sm text-blue-800 font-medium">
                        Improvement from Level 6: {currentStrand === 1 ? 'Addition of scientific background and principles (magnetic field strength, domains, inverse square law)' : 
                                                 currentStrand === 2 ? 'Detailed scientific explanation with reference to physical principles' : 
                                                 currentStrand === 3 ? 'Comprehensive descriptions of methods to control variables with specific techniques' : 
                                                 'Detailed step-by-step instructions with quality control measures'}
                      </div>
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border">
                        {experimentData['temperature'][`strand${currentStrand}`].level8}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Your Experiment Tab */}
        {currentTab === 'your' && (
          <div>
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-4 flex items-center">
                <span className="text-xl mr-2">📝</span>
                Your {currentStrand === 1 ? 'Research Question' : currentStrand === 2 ? 'Hypothesis' : currentStrand === 3 ? 'Variables' : 'Methodology'}
              </h3>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  {/* Keep your existing tips section */}
                </div>
                
                <h4 className="font-medium mb-2">Write your Level 8 {currentStrand === 1 ? 'Research Question' : currentStrand === 2 ? 'Hypothesis' : currentStrand === 3 ? 'Variables' : 'Methodology'}</h4>
                <div className="relative">
                  <textarea
                    value={userInputs[`strand${currentStrand}`].level8}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      handleInputChange(`strand${currentStrand}`, 'level8', newValue);
                      
                      // Add real-time analysis for Strands 1, 2, and 3
                      if (currentStrand === 1) {
                        // Keyword analysis for specific terms
                        const keywordAnalysis = analyzeStrand1(newValue);
                        
                        // Concept analysis for broader understanding
                        const conceptAnalysis = analyzeConceptsCoverage(newValue, experimentChoice);
                        
                        // Combine both approaches - take the higher score
                        const combinedLevel = Math.max(keywordAnalysis.level, conceptAnalysis.score);
                        
                        // Update progress in real-time
                        const newProgress = [...strandProgress];
                        newProgress[0] = combinedLevel;
                        setStrandProgress(newProgress);
                      }
                      else if (currentStrand === 2) {
                        // Keyword analysis for specific terms
                        const keywordAnalysis = analyzeStrand2(newValue, experimentChoice);
                        
                        // Concept analysis for broader understanding
                        const conceptAnalysis = analyzeHypothesisConcepts(newValue, experimentChoice);
                        
                        // Combine both approaches - take the higher score
                        const combinedLevel = Math.max(keywordAnalysis.level, conceptAnalysis.score);
                        
                        // Update progress in real-time
                        const newProgress = [...strandProgress];
                        newProgress[1] = combinedLevel;
                        setStrandProgress(newProgress);
                      }
                      else if (currentStrand === 3) {
                        // Keyword analysis for specific terms
                        const keywordAnalysis = analyzeStrand3(newValue, experimentChoice);
                        
                        // Concept analysis for broader understanding
                        const conceptAnalysis = analyzeVariablesConcepts(newValue, experimentChoice);
                        
                        // Combine both approaches - take the higher score
                        const combinedLevel = Math.max(keywordAnalysis.level, conceptAnalysis.score);
                        
                        // Update progress in real-time
                        const newProgress = [...strandProgress];
                        newProgress[2] = combinedLevel;
                        setStrandProgress(newProgress);
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows="12"
                    placeholder={`Enter your complete Level 8 ${currentStrand === 1 ? 'research question' : currentStrand === 2 ? 'hypothesis' : currentStrand === 3 ? 'variables' : 'methodology'} here. Refer to the example in the Guided Example tab.`}
                  ></textarea>

                  {/* Feedback box that appears below the textarea - only for Strand 1 */}
                  {currentStrand === 1 && (
                    <div className="mt-4 p-3 border rounded-lg bg-gray-50">
                      <h5 className="font-medium text-gray-700 mb-2">Research Question Feedback</h5>
                      
                      {/* Progress bar */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full transition-all duration-300"
                            style={{ width: `${(strandProgress[0] / 8) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{strandProgress[0]}/8</span>
                      </div>
                      
                      {/* Dynamic feedback emojis - only show if some progress */}
                      {strandProgress[0] > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {strandProgress[0] >= 2 && <span className="text-xl">✓</span>}
                          {strandProgress[0] >= 4 && <span className="text-xl">👍</span>}
                          {strandProgress[0] >= 6 && <span className="text-xl">🌟</span>}
                          {strandProgress[0] >= 8 && <span className="text-xl">🏆</span>}
                        </div>
                      )}
                      
                      {/* Detected keywords */}
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Detected keywords:</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {analyzeStrand1(userInputs.strand1.level8).keywords.map((keyword, idx) => (
                            <span 
                              key={idx} 
                              className={`inline-block px-2 py-1 rounded text-xs ${
                                keyword.level === 'level8' ? 'bg-green-100 text-green-800 font-bold' : 
                                keyword.level === 'level6' ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {keyword.word}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Concept coverage feedback */}
                      {userInputs.strand1.level8.length > 50 && (
                        <div className="mt-3 border-t pt-3">
                          <p className="text-sm font-medium text-gray-700">Concept Analysis:</p>
                          
                          {(() => {
                            const conceptAnalysis = analyzeConceptsCoverage(userInputs.strand1.level8, experimentChoice);
                            
                            if (conceptAnalysis.concepts.length > 0) {
                              return (
                                <div className="mt-1">
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {conceptAnalysis.concepts.map((concept, idx) => (
                                      <span 
                                        key={idx}
                                        className={`inline-block px-2 py-1 rounded text-xs ${
                                          concept.level === 8 ? 'bg-green-100 text-green-800 font-bold' : 
                                          'bg-blue-100 text-blue-800'
                                        }`}
                                      >
                                        {concept.name}
                                      </span>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {conceptAnalysis.conceptCounts.level6 > 0 && 
                                      `You've covered ${conceptAnalysis.conceptCounts.level6}/3 Level 6 concepts. `}
                                    {conceptAnalysis.conceptCounts.level8 > 0 && 
                                      `You've covered ${conceptAnalysis.conceptCounts.level8}/3 Level 8 concepts.`}
                                  </p>
                                </div>
                              );
                            }
                            return <p className="text-xs text-gray-500">Keep adding scientific concepts to improve your question</p>;
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback box that appears below the textarea - only for Strand 2 */}
                  {currentStrand === 2 && (
                    <div className="mt-4 p-3 border rounded-lg bg-gray-50">
                      <h5 className="font-medium text-gray-700 mb-2">Hypothesis Feedback</h5>
                      
                      {/* Progress bar */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full transition-all duration-300"
                            style={{ width: `${(strandProgress[1] / 8) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{strandProgress[1]}/8</span>
                      </div>
                      
                      {/* Dynamic feedback emojis - only show if some progress */}
                      {strandProgress[1] > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {strandProgress[1] >= 2 && <span className="text-xl">✓</span>}
                          {strandProgress[1] >= 4 && <span className="text-xl">👍</span>}
                          {strandProgress[1] >= 6 && <span className="text-xl">🌟</span>}
                          {strandProgress[1] >= 8 && <span className="text-xl">🏆</span>}
                        </div>
                      )}
                      
                      {/* Detected keywords */}
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Detected keywords:</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {analyzeStrand2(userInputs.strand2.level8, experimentChoice).keywords.map((keyword, idx) => (
                            <span 
                              key={idx} 
                              className={`inline-block px-2 py-1 rounded text-xs ${
                                keyword.level === 'level8' ? 'bg-green-100 text-green-800 font-bold' : 
                                keyword.level === 'level6' ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {keyword.word}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Concept coverage feedback */}
                      {userInputs.strand2.level8.length > 50 && (
                        <div className="mt-3 border-t pt-3">
                          <p className="text-sm font-medium text-gray-700">Concept Analysis:</p>
                          
                          {(() => {
                            const conceptAnalysis = analyzeHypothesisConcepts(userInputs.strand2.level8, experimentChoice);
                            
                            if (conceptAnalysis.concepts.length > 0) {
                              return (
                                <div className="mt-1">
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {conceptAnalysis.concepts.map((concept, idx) => (
                                      <span 
                                        key={idx}
                                        className={`inline-block px-2 py-1 rounded text-xs ${
                                          concept.level === 8 ? 'bg-green-100 text-green-800 font-bold' : 
                                          concept.level === 6 ? 'bg-blue-100 text-blue-800' :
                                          'bg-yellow-100 text-yellow-800'
                                        }`}
                                      >
                                        {concept.name}
                                      </span>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {conceptAnalysis.conceptCounts.level4 > 0 && 
                                      `You've covered ${conceptAnalysis.conceptCounts.level4}/2 Level 4 concepts. `}
                                    {conceptAnalysis.conceptCounts.level6 > 0 && 
                                      `You've covered ${conceptAnalysis.conceptCounts.level6}/3 Level 6 concepts. `}
                                    {conceptAnalysis.conceptCounts.level8 > 0 && 
                                      `You've covered ${conceptAnalysis.conceptCounts.level8}/4 Level 8 concepts.`}
                                  </p>
                                </div>
                              );
                            }
                            return <p className="text-xs text-gray-500">Start with an "If-Then" statement and add scientific reasoning to improve your hypothesis</p>;
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback box that appears below the textarea - only for Strand 3 */}
                  {currentStrand === 3 && (
                    <div className="mt-4 p-3 border rounded-lg bg-gray-50">
                      <h5 className="font-medium text-gray-700 mb-2">Variables Feedback</h5>
                      
                      {/* Progress bar */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full transition-all duration-300"
                            style={{ width: `${(strandProgress[2] / 8) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{strandProgress[2]}/8</span>
                      </div>
                      
                      {/* Dynamic feedback emojis - only show if some progress */}
                      {strandProgress[2] > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {strandProgress[2] >= 2 && <span className="text-xl">✓</span>}
                          {strandProgress[2] >= 4 && <span className="text-xl">👍</span>}
                          {strandProgress[2] >= 6 && <span className="text-xl">🌟</span>}
                          {strandProgress[2] >= 8 && <span className="text-xl">🏆</span>}
                        </div>
                      )}
                      
                      {/* Detected keywords */}
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Detected keywords:</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {analyzeStrand3(userInputs.strand3.level8, experimentChoice).keywords.map((keyword, idx) => (
                            <span 
                              key={idx} 
                              className={`inline-block px-2 py-1 rounded text-xs ${
                                keyword.level === 'level8' ? 'bg-green-100 text-green-800 font-bold' : 
                                keyword.level === 'level6' ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {keyword.word}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Concept coverage feedback */}
                      {userInputs.strand3.level8.length > 50 && (
                        <div className="mt-3 border-t pt-3">
                          <p className="text-sm font-medium text-gray-700">Concept Analysis:</p>
                          
                          {(() => {
                            const conceptAnalysis = analyzeVariablesConcepts(userInputs.strand3.level8, experimentChoice);
                            
                            if (conceptAnalysis.concepts.length > 0) {
                              return (
                                <div className="mt-1">
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {conceptAnalysis.concepts.map((concept, idx) => (
                                      <span 
                                        key={idx}
                                        className={`inline-block px-2 py-1 rounded text-xs ${
                                          concept.level === 8 ? 'bg-green-100 text-green-800 font-bold' : 
                                          concept.level ===
                                          concept.level === 8 ? 'bg-green-100 text-green-800 font-bold' : 
                                          concept.level === 6 ? 'bg-blue-100 text-blue-800' :
                                          'bg-yellow-100 text-yellow-800'
                                        }`}
                                      >
                                        {concept.name}
                                      </span>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {conceptAnalysis.conceptCounts.level4 > 0 && 
                                      `You've covered ${conceptAnalysis.conceptCounts.level4}/3 Level 4 concepts. `}
                                    {conceptAnalysis.conceptCounts.level6 > 0 && 
                                      `You've covered ${conceptAnalysis.conceptCounts.level6}/4 Level 6 concepts. `}
                                    {conceptAnalysis.conceptCounts.level8 > 0 && 
                                      `You've covered ${conceptAnalysis.conceptCounts.level8}/4 Level 8 concepts.`}
                                  </p>
                                </div>
                              );
                            }
                            return <p className="text-xs text-gray-500">Start by clearly identifying the IV, DV, and CVs and how they will be measured and controlled.</p>;
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback box that appears below the textarea - only for Strand 4 */}
                  {currentStrand === 4 && (
                    <div className="mt-4 p-3 border rounded-lg bg-gray-50">
                      <h5 className="font-medium text-gray-700 mb-2">Methodology Feedback</h5>
                      
                      {/* Progress bar */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full transition-all duration-300"
                            style={{ width: `${(strandProgress[3] / 8) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{strandProgress[3]}/8</span>
                      </div>
                      
                      {/* Dynamic feedback emojis - only show if some progress */}
                      {strandProgress[3] > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {strandProgress[3] >= 2 && <span className="text-xl">✓</span>}
                          {strandProgress[3] >= 4 && <span className="text-xl">👍</span>}
                          {strandProgress[3] >= 6 && <span className="text-xl">🌟</span>}
                          {strandProgress[3] >= 8 && <span className="text-xl">🏆</span>}
                        </div>
                      )}
                      
                      {/* Simple feedback - this can be enhanced similar to other strands if needed */}
                      <div className="mt-2 text-sm text-gray-700">
                        <p className="mb-2">Your methodology should include:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li className={strandProgress[3] >= 3 ? "text-green-600" : "text-gray-500"}>Required materials and equipment</li>
                          <li className={strandProgress[3] >= 4 ? "text-green-600" : "text-gray-500"}>Safety precautions and hazards</li>
                          <li className={strandProgress[3] >= 6 ? "text-green-600" : "text-gray-500"}>Logical step-by-step procedure</li>
                          <li className={strandProgress[3] >= 7 ? "text-green-600" : "text-gray-500"}>Quality control measures</li>
                          <li className={strandProgress[3] >= 8 ? "text-green-600" : "text-gray-500"}>Detailed setup and precise measurements</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>Refer to the grading rubric to ensure you include all necessary components for a Level 8 response.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-8">
          <button
            onClick={goToPreviousStrand}
            disabled={currentStrand === 1}
            className={`flex items-center px-4 py-2 rounded-lg ${currentStrand === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            <span className="mr-2">◀️</span>
            Previous Strand
          </button>
          
          <button
            onClick={goToNextStrand}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {currentStrand < 4 ? 'Next Strand' : 'Finish'}
            <span className="ml-2">▶️</span>
          </button>
        </div>
      </main>
    </div>
  </div>
);
};

export default App;




