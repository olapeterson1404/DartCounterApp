package dartcounter.model;

public class GameSettings {
    private final int startScore;
    private final CheckoutRule checkoutRule;
    private final int setsConfigured;
    private final int legsConfigured;
    private final SetLegMode setLegMode;
    private final int setsTarget;
    private final int legsTarget;

    public GameSettings(int startScore, CheckoutRule checkoutRule, int setsConfigured, int legsConfigured,
                        SetLegMode setLegMode) {
        this.startScore = startScore;
        this.checkoutRule = checkoutRule;
        this.setsConfigured = setsConfigured;
        this.legsConfigured = legsConfigured;
        this.setLegMode = setLegMode;
        this.setsTarget = targetWins(setsConfigured, setLegMode);
        this.legsTarget = targetWins(legsConfigured, setLegMode);
    }

    private int targetWins(int configuredValue, SetLegMode mode) {
        if (mode == SetLegMode.FIRST_TO) {
            return configuredValue;
        }
        return configuredValue / 2 + 1;
    }

    public int getStartScore() {
        return startScore;
    }

    public CheckoutRule getCheckoutRule() {
        return checkoutRule;
    }

    public int getSetsConfigured() {
        return setsConfigured;
    }

    public int getLegsConfigured() {
        return legsConfigured;
    }

    public SetLegMode getSetLegMode() {
        return setLegMode;
    }

    public int getSetsTarget() {
        return setsTarget;
    }

    public int getLegsTarget() {
        return legsTarget;
    }
}
