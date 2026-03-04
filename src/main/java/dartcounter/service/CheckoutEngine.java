package dartcounter.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import dartcounter.model.CheckoutRule;

public class CheckoutEngine {
    private static class HitOption {
        final int base;
        final int multiplier;
        final int score;
        final String label;

        HitOption(int base, int multiplier, int score, String label) {
            this.base = base;
            this.multiplier = multiplier;
            this.score = score;
            this.label = label;
        }

        int routeRank() {
            if (multiplier == 3) {
                return 300 + base;
            }
            if (multiplier == 2) {
                return 200 + base;
            }
            if (base == 25) {
                return 125;
            }
            return 100 + base;
        }
    }

    public List<String> buildSuggestions(int remaining, CheckoutRule rule, int limit) {
        List<String> lines = new ArrayList<>();
        if (remaining <= 1) {
            return lines;
        }

        List<List<HitOption>> routes = findCheckoutRoutes(remaining, rule, limit);
        for (List<HitOption> route : routes) {
            lines.add(String.join(" + ", route.stream().map(hit -> hit.label).toList()));
        }
        return lines;
    }

    private List<List<HitOption>> findCheckoutRoutes(int remaining, CheckoutRule rule, int limit) {
        List<HitOption> scoringHits = buildScoringHitOrder();
        List<HitOption> finishHits = buildFinishingHitOrder(rule);
        List<List<HitOption>> candidates = new ArrayList<>();
        Set<String> dedupe = new HashSet<>();

        for (int darts = 1; darts <= 3; darts++) {
            List<List<HitOption>> dartCandidates = collectForDartCount(remaining, darts, scoringHits, finishHits);
            for (List<HitOption> route : dartCandidates) {
                String key = routeToString(route);
                if (dedupe.add(key)) {
                    candidates.add(route);
                }
            }
        }

        candidates.sort((a, b) -> compareRoutes(a, b, rule));
        if (candidates.size() > limit) {
            return new ArrayList<>(candidates.subList(0, limit));
        }
        return candidates;
    }

    private List<List<HitOption>> collectForDartCount(int remaining, int darts,
                                                      List<HitOption> scoringHits, List<HitOption> finishHits) {
        List<List<HitOption>> found = new ArrayList<>();
        if (darts == 1) {
            for (HitOption finisher : finishHits) {
                if (finisher.score == remaining) {
                    found.add(List.of(finisher));
                }
            }
            return found;
        }

        for (HitOption first : scoringHits) {
            if (first.score >= remaining) {
                continue;
            }
            int leftAfterFirst = remaining - first.score;

            if (darts == 2) {
                for (HitOption finisher : finishHits) {
                    if (finisher.score == leftAfterFirst) {
                        found.add(List.of(first, finisher));
                    }
                }
                continue;
            }

            for (HitOption second : scoringHits) {
                if (second.score >= leftAfterFirst) {
                    continue;
                }
                int leftAfterSecond = leftAfterFirst - second.score;
                for (HitOption finisher : finishHits) {
                    if (finisher.score == leftAfterSecond) {
                        found.add(List.of(first, second, finisher));
                    }
                }
            }
        }

        return found;
    }

    private int compareRoutes(List<HitOption> left, List<HitOption> right, CheckoutRule rule) {
        if (left.size() != right.size()) {
            return Integer.compare(left.size(), right.size());
        }

        int leftFinal = finalShotPreference(left.get(left.size() - 1), rule);
        int rightFinal = finalShotPreference(right.get(right.size() - 1), rule);
        if (leftFinal != rightFinal) {
            return Integer.compare(rightFinal, leftFinal);
        }

        if (rule == CheckoutRule.STRAIGHT_OUT) {
            int leftSimple = simplicityScore(left);
            int rightSimple = simplicityScore(right);
            if (leftSimple != rightSimple) {
                return Integer.compare(rightSimple, leftSimple);
            }
        }

        int leftAggression = nonFinalAggressionScore(left);
        int rightAggression = nonFinalAggressionScore(right);
        if (leftAggression != rightAggression) {
            return Integer.compare(rightAggression, leftAggression);
        }

        int leftDouble = preferredDoubleScore(left);
        int rightDouble = preferredDoubleScore(right);
        if (leftDouble != rightDouble) {
            return Integer.compare(rightDouble, leftDouble);
        }

        int leftBullPenalty = bullPenalty(left);
        int rightBullPenalty = bullPenalty(right);
        if (leftBullPenalty != rightBullPenalty) {
            return Integer.compare(leftBullPenalty, rightBullPenalty);
        }

        return routeToString(left).compareTo(routeToString(right));
    }

    private int finalShotPreference(HitOption finisher, CheckoutRule rule) {
        if (rule == CheckoutRule.STRAIGHT_OUT) {
            if (finisher.multiplier == 2) {
                return 300;
            }
            if (finisher.multiplier == 3) {
                return 250;
            }
            if (finisher.base == 25) {
                return 200;
            }
            return 100;
        }
        if (rule == CheckoutRule.DOUBLE_OUT) {
            return preferredDoubleBaseScore(finisher.base);
        }
        if (finisher.multiplier == 2) {
            return 220 + preferredDoubleBaseScore(finisher.base);
        }
        return 170 + finisher.base;
    }

    private int nonFinalAggressionScore(List<HitOption> route) {
        int score = 0;
        for (int i = 0; i < route.size() - 1; i++) {
            score += route.get(i).routeRank();
        }
        return score;
    }

    private int simplicityScore(List<HitOption> route) {
        int score = 0;
        for (int i = 0; i < route.size() - 1; i++) {
            HitOption hit = route.get(i);
            if (hit.multiplier == 1) {
                score += 3;
            } else if (hit.multiplier == 2) {
                score += 2;
            } else {
                score += 1;
            }
        }
        return score;
    }

    private int preferredDoubleScore(List<HitOption> route) {
        HitOption finisher = route.get(route.size() - 1);
        if (finisher.multiplier == 2) {
            return preferredDoubleBaseScore(finisher.base);
        }
        return 0;
    }

    private int preferredDoubleBaseScore(int base) {
        int[] preferred = {20, 16, 18, 12, 10, 8, 14, 6, 4, 2, 25, 15, 11, 9, 7, 5, 3, 1, 13, 17, 19};
        for (int i = 0; i < preferred.length; i++) {
            if (preferred[i] == base) {
                return 100 - i;
            }
        }
        return 0;
    }

    private int bullPenalty(List<HitOption> route) {
        int penalty = 0;
        for (int i = 0; i < route.size() - 1; i++) {
            if (route.get(i).base == 25) {
                penalty++;
            }
        }
        return penalty;
    }

    private String routeToString(List<HitOption> route) {
        return String.join("+", route.stream().map(hit -> hit.label).toList());
    }

    private List<HitOption> buildScoringHitOrder() {
        List<HitOption> hits = new ArrayList<>();

        for (int value = 20; value >= 1; value--) {
            hits.add(new HitOption(value, 3, value * 3, "T" + value));
        }
        for (int value = 20; value >= 1; value--) {
            hits.add(new HitOption(value, 2, value * 2, "D" + value));
        }
        for (int value = 20; value >= 1; value--) {
            hits.add(new HitOption(value, 1, value, String.valueOf(value)));
        }
        hits.add(new HitOption(25, 2, 50, "D25"));
        hits.add(new HitOption(25, 1, 25, "25"));

        return hits;
    }

    private List<HitOption> buildFinishingHitOrder(CheckoutRule rule) {
        List<HitOption> finishes = new ArrayList<>();

        int[] doublesPriority = {20, 16, 18, 12, 10, 8, 14, 6, 4, 2, 25, 15, 11, 9, 7, 5, 3, 1, 13, 17, 19};
        for (int value : doublesPriority) {
            finishes.add(new HitOption(value, 2, value * 2, "D" + value));
        }

        if (rule == CheckoutRule.MASTER_OUT) {
            for (int value = 20; value >= 1; value--) {
                finishes.add(new HitOption(value, 3, value * 3, "T" + value));
            }
        }

        if (rule == CheckoutRule.STRAIGHT_OUT) {
            for (int value = 20; value >= 1; value--) {
                finishes.add(new HitOption(value, 3, value * 3, "T" + value));
            }
            for (int value = 20; value >= 1; value--) {
                finishes.add(new HitOption(value, 1, value, String.valueOf(value)));
            }
            finishes.add(new HitOption(25, 1, 25, "25"));
        }

        return finishes;
    }
}
