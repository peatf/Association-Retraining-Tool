import React, { useState, useEffect, memo } from "react";
import styled from "styled-components";
import { useSession } from "../context/SessionContext";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import BaseCard from "./BaseCard";
import { Spinner, ErrorState } from "./common";
import contentSearchService from "../services/ContentSearchService";

const PickerContainer = styled.div`
  padding: 1rem;
`;

const SelectionHeader = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;

  h4 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  p {
    margin: 0;
    color: #666;
    line-height: 1.4;
  }
`;

const TopicSelection = styled.div`
  margin-bottom: 2rem;

  h4 {
    margin-bottom: 1rem;
    color: #333;
  }
`;

const TopicButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const TopicButton = styled.button<{ selected?: boolean }>`
  padding: 1.5rem;
  background: ${(props) => (props.selected ? "#e3f2fd" : "#f8f9fa")};
  border: 2px solid ${(props) => (props.selected ? "#2196f3" : "#dee2e6")};
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    border-color: #2196f3;
    background: #e3f2fd;
  }

  .topic-icon {
    font-size: 2rem;
  }

  .topic-name {
    font-weight: 600;
    color: #333;
  }
`;

const HierarchicalThoughts = styled.div`
  margin-top: 2rem;
`;

const ThoughtLevels = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ThoughtLevel = styled.div<{ level: number }>`
  border: 2px solid
    ${(props) => {
      const colors = ["#e9ecef", "#d1ecf1", "#d4edda", "#fff3cd"];
      return colors[props.level - 1] || "#e9ecef";
    }};
  border-radius: 12px;
  padding: 1.5rem;
  background: ${(props) => {
    const backgrounds = ["#f8f9fa", "#f1f9fc", "#f8fff9", "#fffef5"];
    return backgrounds[props.level - 1] || "#f8f9fa";
  }};
`;

const LevelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h5 {
    margin: 0;
    color: #333;
    font-size: 1.1rem;
  }
`;

const LevelDescription = styled.span<{ level: number }>`
  font-size: 0.875rem;
  color: ${(props) => {
    const colors = ["#6c757d", "#0c5460", "#155724", "#856404"];
    return colors[props.level - 1] || "#6c757d";
  }};
  font-style: italic;
`;

const ThoughtsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const ThoughtCard = styled.div<{ selected?: boolean; level: number }>`
  padding: 1rem;
  background: white;
  border: 2px solid ${(props) => (props.selected ? "#28a745" : "#dee2e6")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: #28a745;
    box-shadow: 0 2px 8px rgba(40, 167, 69, 0.15);
  }

  .thought-content {
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
    color: #333;
  }

  .thought-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const LevelIndicator = styled.span<{ level: number }>`
  background: ${(props) => {
    const colors = ["#6c757d", "#17a2b8", "#28a745", "#ffc107"];
    return colors[props.level - 1] || "#6c757d";
  }};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const SelectedThoughtsSummary = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8fff8;
  border: 2px solid #28a745;
  border-radius: 12px;

  h5 {
    margin: 0 0 1rem 0;
    color: #155724;
  }

  ul {
    margin: 0 0 1.5rem 0;
    padding-left: 0;
    list-style: none;
  }

  li {
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    background: white;
    border-radius: 6px;
    border-left: 4px solid #28a745;
  }

  strong {
    color: #155724;
  }
`;

const CompleteButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background 0.2s ease;

  &:hover {
    background: #218838;
  }
`;

interface HierarchicalThought {
  content: string;
  level: number;
  id: string;
}

interface SelectedThought {
  content: string;
  selectedLevel: number;
  id: string;
}

const ThoughtPicker = memo(() => {
  const { canvasState, updateCanvasState, addInsight } = useSession();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [availableThoughts, setAvailableThoughts] = useState<
    Record<string, HierarchicalThought[]>
  >({
    level1: [],
    level2: [],
    level3: [],
    level4: [],
  });
  const [selectedThoughts, setSelectedThoughts] = useState<SelectedThought[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const topics = [
    { id: "Money", name: "Money", icon: "💰" },
    { id: "Relationships", name: "Relationships", icon: "💕" },
    { id: "Self-Image", name: "Self-Image", icon: "🪞" },
  ];

  const levelDescriptions = {
    1: "Most neutral and believable",
    2: "Gentle improvement",
    3: "Moderate empowerment",
    4: "Most empowered and aspirational",
  };

  useEffect(() => {
    if (selectedTopic && selectedSubcategory) {
      loadHierarchicalThoughts();
    }
  }, [selectedTopic, selectedSubcategory]);

  const loadHierarchicalThoughts = async () => {
    try {
      setLoading(true);
      const hierarchicalThoughts =
        await contentSearchService.getHierarchicalReplacementThoughts(
          selectedTopic!,
          selectedSubcategory
        );

      // Convert to the format expected by the component
      const organizedThoughts =
        organizeHierarchicalThoughts(hierarchicalThoughts);
      setAvailableThoughts(organizedThoughts);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error("Error loading thoughts:", err);
    } finally {
      setLoading(false);
    }
  };

  const organizeHierarchicalThoughts = (
    hierarchicalThoughts: Record<string, string[]>
  ): Record<string, HierarchicalThought[]> => {
    const organized: Record<string, HierarchicalThought[]> = {
      level1: [],
      level2: [],
      level3: [],
      level4: [],
    };

    // Convert each level's thoughts to HierarchicalThought objects
    for (let level = 1; level <= 4; level++) {
      const levelKey = `level${level}`;
      const thoughts = hierarchicalThoughts[levelKey] || [];

      organized[levelKey] = thoughts.map((content, index) => ({
        content,
        level,
        id: `${levelKey}-${index}`,
      }));
    }

    return organized;
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    loadSubcategories(topic);
  };

  const loadSubcategories = async (topic: string) => {
    try {
      const subcategories = await contentSearchService.getSubcategories(topic);
      // For now, auto-select the first subcategory or use a default
      if (subcategories.length > 0) {
        setSelectedSubcategory(subcategories[0]);
      } else {
        setSelectedSubcategory("general");
      }
    } catch (err) {
      console.error("Error loading subcategories:", err);
      setSelectedSubcategory("general");
    }
  };

  const handleThoughtSelect = (thought: HierarchicalThought, level: number) => {
    const thoughtWithLevel: SelectedThought = {
      ...thought,
      selectedLevel: level,
    };

    setSelectedThoughts((prev) => {
      // Check if thought is already selected
      const existingIndex = prev.findIndex((t) => t.id === thought.id);
      if (existingIndex >= 0) {
        // Remove if already selected
        return prev.filter((t) => t.id !== thought.id);
      } else {
        // Add new selection
        return [...prev, thoughtWithLevel];
      }
    });

    addInsight({
      type: "replacement_thought",
      text: thought.content,
      source: "thought_picker",
      metadata: {
        level: level,
      },
    });
  };

  const handleComplete = () => {
    updateCanvasState({
      pickerResults: {
        topic: selectedTopic,
        subcategory: selectedSubcategory,
        selectedThoughts,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(
      "Thought Picker complete with",
      selectedThoughts.length,
      "thoughts"
    );
  };

  const isThoughtSelected = (thoughtId: string): boolean => {
    return selectedThoughts.some((t) => t.id === thoughtId);
  };

  return (
    <BaseCard
      title="Choose Better-Feeling Thoughts"
      testId="thought-picker"
      showActions={false}
    >
      <PickerContainer>
        {!selectedTopic && (
          <TopicSelection>
            <h4>Which area would you like to explore?</h4>
            <TopicButtons>
              {topics.map((topic) => (
                <TopicButton
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic.id)}
                  data-testid={`topic-${topic.id.toLowerCase()}`}
                >
                  <span className="topic-icon">{topic.icon}</span>
                  <span className="topic-name">{topic.name}</span>
                </TopicButton>
              ))}
            </TopicButtons>
          </TopicSelection>
        )}

        {selectedTopic && selectedSubcategory && (
          <HierarchicalThoughts>
            <SelectionHeader>
              <h4>
                {selectedTopic} → {selectedSubcategory}
              </h4>
              <p>
                Choose thoughts that feel authentic to you right now. Start with
                Level 1 if you need something gentle and believable.
              </p>
            </SelectionHeader>

            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <Spinner message="Loading better-feeling thoughts..." />
              </div>
            ) : error ? (
              <ErrorState
                message={error.message}
                onRetry={loadHierarchicalThoughts}
              />
            ) : (
              <ThoughtLevels>
                {[1, 2, 3, 4].map((level) => (
                  <ThoughtLevel key={level} level={level}>
                    <LevelHeader>
                      <h5>Level {level}</h5>
                      <LevelDescription level={level}>
                        {
                          levelDescriptions[
                            level as keyof typeof levelDescriptions
                          ]
                        }
                      </LevelDescription>
                    </LevelHeader>

                    <ThoughtsGrid>
                      {availableThoughts[
                        `level${level}` as keyof typeof availableThoughts
                      ]?.map((thought, index) => (
                        <ThoughtCard
                          key={`${level}-${index}`}
                          level={level}
                          selected={isThoughtSelected(thought.id)}
                          onClick={() => handleThoughtSelect(thought, level)}
                          data-testid={`thought-level-${level}-${index}`}
                        >
                          <p className="thought-content">{thought.content}</p>
                          <div className="thought-meta">
                            <LevelIndicator level={level}>
                              Level {level}
                            </LevelIndicator>
                          </div>
                        </ThoughtCard>
                      ))}
                    </ThoughtsGrid>
                  </ThoughtLevel>
                ))}
              </ThoughtLevels>
            )}

            {selectedThoughts.length > 0 && (
              <SelectedThoughtsSummary>
                <h5>Your Selected Thoughts:</h5>
                <ul>
                  {selectedThoughts.map((thought, index) => (
                    <li key={index}>
                      <strong>Level {thought.selectedLevel}:</strong>{" "}
                      {thought.content}
                    </li>
                  ))}
                </ul>

                <div style={{ textAlign: "center" }}>
                  <CompleteButton
                    onClick={handleComplete}
                    data-testid="complete-thought-selection"
                  >
                    Complete Selection ({selectedThoughts.length} thoughts)
                  </CompleteButton>
                </div>
              </SelectedThoughtsSummary>
            )}
          </HierarchicalThoughts>
        )}
      </PickerContainer>
    </BaseCard>
  );
});

export default ThoughtPicker;
