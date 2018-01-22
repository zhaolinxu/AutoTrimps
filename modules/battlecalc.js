//what is either "health" or "attack" or "block"
// function ripped from Trimps "updates.js" line 1009
function getBattleStats(what,form,crit) {
    var currentCalc = 0;
//  var maxFluct = 0.2;
//  var minFluct = 0.2;
    if (what == "health" || what == "attack"){
        currentCalc += (what == "health") ? 50 : 6;
/*      if (what == "attack"){
            //Discipline
            if (game.global.challengeActive == "Discipline"){
                minFluct = 0.995;
                maxFluct = 0.995;
            }
            else {
                //Range
                    if (game.portal.Range.level > 0){
                        minFluct -= (0.02 * game.portal.Range.level);
                    }
                //MinDamageDaily
                    if (typeof game.global.dailyChallenge.minDamage !== 'undefined'){
                        var addMin = dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength);
                        minFluct += addMin;
                        if (minFluct > 1) minFluct = 1;
                    }
                //MaxDamageDaily
                    if (typeof game.global.dailyChallenge.maxDamage !== 'undefined'){
                        var addMax = dailyModifiers.maxDamage.getMult(game.global.dailyChallenge.maxDamage.strength);
                        maxFluct += addMax;
                    }
            }
        } */
        for (var equip in game.equipment){
            var temp = game.equipment[equip];
            if (typeof temp[what] === 'undefined' || temp.level <= 0 || temp.blockNow) continue;
            var equipStrength = temp[what + "Calculated"] * temp.level;
            currentCalc += equipStrength;
        }
    }
    else if (what == "block"){
        //Add Gym
        var gym = game.buildings.Gym;
        if (gym.owned > 0){
            var gymStrength = gym.owned * gym.increase.by;
            currentCalc += gymStrength;
        }
        var shield = game.equipment.Shield;
        if (shield.blockNow && shield.level > 0){
            var shieldStrength = shield.level * shield.blockCalculated;
            currentCalc += shieldStrength;
        }
        var trainer = game.jobs.Trainer;
        if (trainer.owned > 0){
            var trainerStrength = trainer.owned * (trainer.modifier / 100);
            trainerStrength = calcHeirloomBonus("Shield", "trainerEfficiency", trainerStrength);
            currentCalc  *= (trainerStrength + 1);
        }
    }
    //Add coordination
    currentCalc  *= game.resources.trimps.maxSoldiers;
    //Add achievements
    if (what == "attack" && game.global.achievementBonus > 0){
        currentCalc *= 1 + (game.global.achievementBonus / 100);
    }
    //Add perk
    var perk = "";
    if (what == "health") perk = "Toughness";
    if (what == "attack") perk = "Power";
    if (perk && game.portal[perk].level > 0){
        var PerkStrength = (game.portal[perk].level * game.portal[perk].modifier);
        currentCalc  *= (PerkStrength + 1);
    }
    perk = perk + "_II";
    if (game.portal[perk] && game.portal[perk].level > 0){
        var PerkStrength = (game.portal[perk].level * game.portal[perk].modifier);
        currentCalc  *= (PerkStrength + 1);
    }
    //Add resilience
    if (what == "health" && game.portal.Resilience.level > 0){
        var resStrength = Math.pow(game.portal.Resilience.modifier + 1, game.portal.Resilience.level);
        currentCalc *= resStrength;
    }
    //Add Geneticist
    var geneticist = game.jobs.Geneticist;
    if (geneticist.owned > 0 && what == "health"){
        var geneticistStrength = Math.pow(1.01, game.global.lastLowGen);
        currentCalc  *= geneticistStrength;
    }
    //Add Anticipation
    var anticipation = game.portal.Anticipation;
    if (anticipation.level > 0 && what == "attack"){
        var antiStrength = ((anticipation.level * anticipation.modifier * game.global.antiStacks) + 1);
        currentCalc *= antiStrength;
    }
    //Add formations
    if (form && game.global.formation > 0){
        var formStrength = 0.5;
        if ((game.global.formation == 1 && what == "health") || (game.global.formation == 2 && what == "attack") || (game.global.formation == 3 && what == "block")) formStrength = 4;
        currentCalc *= formStrength;
    }
    //radiostacks increases from "Electricity" || "Mapocalypse"
    if (game.global.radioStacks > 0 && what == "attack") {
        currentCalc *= (1 - (game.global.radioStacks * 0.1));
    }
    //Add Titimp
    if (game.global.titimpLeft > 1 && game.global.mapsActive && what == "attack"){
        currentCalc *= 2;
    }
    //Add map bonus
    if (!game.global.mapsActive && game.global.mapBonus > 0 && what == "attack"){
        var mapBonusMult = 0.2 * game.global.mapBonus;
        currentCalc *= (1 + mapBonusMult);
        mapBonusMult *= 100;
    }
    //Add RoboTrimp
    if (what == "attack" && game.global.roboTrimpLevel > 0){
        var roboTrimpMod = 0.2 * game.global.roboTrimpLevel;
        currentCalc *= (1 + roboTrimpMod);
        roboTrimpMod *= 100;
    }
    if (what == "health" && game.global.totalSquaredReward > 0) {
        currentCalc *= ((game.global.totalSquaredReward / 100) + 1);
    }
    //Add challenges
    if (what == "health" && game.global.challengeActive == "Balance"){
        currentCalc *= game.challenges.Balance.getHealthMult();
    }
    if (what == "attack" && game.global.challengeActive == "Lead" && ((game.global.world % 2) == 1)){
        currentCalc *= 1.5;
    }
    var heirloomBonus = calcHeirloomBonus("Shield", "trimp" + capitalizeFirstLetter(what), 0, true);
    if (heirloomBonus > 0){
        currentCalc *= ((heirloomBonus / 100) + 1);
    }
    if (game.global.challengeActive == "Decay" && what == "attack"){
        currentCalc *= 5;
        var stackStr = Math.pow(0.995, game.challenges.Decay.stacks);
        currentCalc *= stackStr;
    }
    if (game.global.challengeActive == "Daily"){
        var mult = 0;
        if (typeof game.global.dailyChallenge.weakness !== 'undefined' && what == "attack"){
            mult = dailyModifiers.weakness.getMult(game.global.dailyChallenge.weakness.strength, game.global.dailyChallenge.weakness.stacks);
            currentCalc *= mult;
        }
        if (typeof game.global.dailyChallenge.oddTrimpNerf !== 'undefined' && what == "attack" && (game.global.world % 2 == 1)){
            mult = dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength);
            currentCalc *= mult;
        }
        if (typeof game.global.dailyChallenge.evenTrimpBuff !== 'undefined' && what == "attack" && (game.global.world % 2 == 0)){
            mult = dailyModifiers.evenTrimpBuff.getMult(game.global.dailyChallenge.evenTrimpBuff.strength);
            currentCalc *= mult;
        }
        if (typeof game.global.dailyChallenge.rampage !== 'undefined' && what == "attack"){
            mult = dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, game.global.dailyChallenge.rampage.stacks);
            currentCalc *= mult;
        }
    }
    //Add golden battle
    if (what != "block" && game.goldenUpgrades.Battle.currentBonus > 0){
        amt = game.goldenUpgrades.Battle.currentBonus;
        currentCalc *= 1 + amt;
    }
    if (what != "block" && game.talents.voidPower.purchased && game.global.voidBuff){
        amt = (game.talents.voidPower2.purchased) ? ((game.talents.voidPower3.purchased) ? 65 : 35) : 15;
        currentCalc *= (1 + (amt / 100));
    }
    //Magma
    if (mutations.Magma.active() && (what == "attack" || what == "health")){
        mult = mutations.Magma.getTrimpDecay();
        var lvls = game.global.world - mutations.Magma.start() + 1;
        currentCalc *= mult;
    }
    if (crit) {
        var critChance = getPlayerCritChance();
        if (what == "attack" && critChance){
            currentCalc *= getPlayerCritDamageMult();
        }
    }
    return currentCalc;
}

function calcOurDmg(number,maxormin,disableStances,disableFlucts) { //number = base attack
    var fluctuation = .2; //%fluctuation
    var maxFluct = -1;
    var minFluct = -1;
    //Situational Trimp damage increases
    if (game.global.radioStacks > 0) {
        number *= (1 - (game.global.radioStacks * 0.1));
    }
    if (game.global.antiStacks > 0) {
        number *= ((game.global.antiStacks * game.portal.Anticipation.level * game.portal.Anticipation.modifier) + 1);
        updateAntiStacks();
    }
    // if (!game.global.mapsActive && game.global.mapBonus > 0){
        // number *= ((game.global.mapBonus * .2) + 1);
    // }
    // if (game.global.titimpLeft >= 1 && game.global.mapsActive){
        // number *= 2;
    // }
    if (game.global.achievementBonus > 0){
        number *= (1 + (game.global.achievementBonus / 100));
    }
    if (game.global.challengeActive == "Discipline"){
        fluctuation = .995;
    }
    else if (game.portal.Range.level > 0){
        minFluct = fluctuation - (.02 * game.portal.Range.level);
    }
    if (game.global.challengeActive == "Decay"){
        number *= 5;
        number *= Math.pow(0.995, game.challenges.Decay.stacks);
    }
    if (game.global.roboTrimpLevel > 0){
        number *= ((0.2 * game.global.roboTrimpLevel) + 1);
    }
    if (game.global.challengeActive == "Lead" && ((game.global.world % 2) == 1)){
        number *= 1.5;
    }
    if (game.goldenUpgrades.Battle.currentBonus > 0){
        number *= game.goldenUpgrades.Battle.currentBonus + 1;
    }
    if (game.talents.voidPower.purchased && game.global.voidBuff){
        var vpAmt = (game.talents.voidPower2.purchased) ? ((game.talents.voidPower3.purchased) ? 65 : 35) : 15;
        number *= ((vpAmt / 100) + 1);
    }
    if (game.global.totalSquaredReward > 0){
        number *= ((game.global.totalSquaredReward / 100) + 1)
    }
    if (game.talents.magmamancer.purchased){
        number *= game.jobs.Magmamancer.getBonusPercent();
    }
    if (game.talents.stillRowing2.purchased){
        number *= ((game.global.spireRows * 0.06) + 1);
    }
    if (game.talents.healthStrength.purchased && mutations.Healthy.active()){
        number *= ((0.15 * mutations.Healthy.cellCount()) + 1);
    }

    if (game.global.challengeActive == "Daily"){
        if (typeof game.global.dailyChallenge.minDamage !== 'undefined'){
            if (minFluct == -1) minFluct = fluctuation;
            minFluct += dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength);
        }
        if (typeof game.global.dailyChallenge.maxDamage !== 'undefined'){
            if (maxFluct == -1) maxFluct = fluctuation;
            maxFluct += dailyModifiers.maxDamage.getMult(game.global.dailyChallenge.maxDamage.strength);
        }
        if (typeof game.global.dailyChallenge.weakness !== 'undefined'){
            number *= dailyModifiers.weakness.getMult(game.global.dailyChallenge.weakness.strength, game.global.dailyChallenge.weakness.stacks);
        }
        if (typeof game.global.dailyChallenge.oddTrimpNerf !== 'undefined' && ((game.global.world % 2) == 1)){
                number *= dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength);
        }
        if (typeof game.global.dailyChallenge.evenTrimpBuff !== 'undefined' && ((game.global.world % 2) == 0)){
                number *= dailyModifiers.evenTrimpBuff.getMult(game.global.dailyChallenge.evenTrimpBuff.strength);
        }
        if (typeof game.global.dailyChallenge.rampage !== 'undefined'){
            number *= dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, game.global.dailyChallenge.rampage.stacks);
        }
    }
    if (!disableStances) {
        //Formations
        if (game.global.formation == 2)
            number /= 4;
        else if (game.global.formation != "0")
            number *= 2;
    }
    if (!disableFlucts) {
        if (minFluct > 1) minFluct = 1;
        if (maxFluct == -1) maxFluct = fluctuation;
        if (minFluct == -1) minFluct = fluctuation;
        var min = Math.floor(number * (1 - minFluct));
        var max = Math.ceil(number + (number * maxFluct));

        //number = Math.floor(Math.random() * ((max + 1) - min)) + min;
        return maxormin ? max : min;
    }
    else
        return number;
}


function calcBadGuyDmg(enemy,attack,daily,maxormin,disableFlucts) {
    var number;
    if (enemy)
        number = enemy.attack;
    else
        number = attack;

    var fluctuation = .2; //%fluctuation
    var maxFluct = -1;
    var minFluct = -1;

    //Situational bad guy damage increases
    if (game.global.challengeActive){
        //Challenge bonuses here
        if (game.global.challengeActive == "Coordinate"){
            number *= getBadCoordLevel();
        }
        else if (game.global.challengeActive == "Meditate"){
            number *= 1.5;
        }
        else if (enemy && game.global.challengeActive == "Nom" && typeof enemy.nomStacks !== 'undefined'){
            number *= Math.pow(1.25, enemy.nomStacks);
        }
        else if (game.global.challengeActive == "Watch") {
            number *= 1.25;
        }
        else if (game.global.challengeActive == "Lead"){
            number *= (1 + (game.challenges.Lead.stacks * 0.04));
        }
        else if (game.global.challengeActive == "Scientist" && getScientistLevel() == 5) {
            number *= 10;
        }
        else if (game.global.challengeActive == "Corrupted"){
            number *= 3;
        }
        if (daily)
            number = calcDailyAttackMod(number);
    }
    if (game.global.usingShriek) {
        number *= game.mapUnlocks.roboTrimp.getShriekValue();
    }

    if (!disableFlucts) {
        if (minFluct > 1) minFluct = 1;
        if (maxFluct == -1) maxFluct = fluctuation;
        if (minFluct == -1) minFluct = fluctuation;
        var min = Math.floor(number * (1 - minFluct));
        var max = Math.ceil(number + (number * maxFluct));

        //number = Math.floor(Math.random() * ((max + 1) - min)) + min;
        return maxormin ? max : min;
    }
    else
        return number;
}
function calcDailyAttackMod(number) {
    if (game.global.challengeActive == "Daily"){
        if (typeof game.global.dailyChallenge.badStrength !== 'undefined'){
            number *= dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength);
        }
        if (typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && game.global.mapsActive){
            number *= dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength);
        }
        if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined'){
            number *= dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks)
        }
    }
    return number;
}
