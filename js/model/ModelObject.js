/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.ModelObject');

/**
 * @interface
 */
dotprod.model.ModelObject = goog.nullFunction;

dotprod.model.ModelObject.prototype.advanceTime = goog.abstractMethod;

/**
 * @return {boolean} Returns true if the object is still valid, false otherwise.
 */
dotprod.model.ModelObject.prototype.isValid = goog.abstractMethod;
