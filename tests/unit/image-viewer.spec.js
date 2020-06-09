import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import ImageViewer from "@/components/ImageViewer.vue";
import { store } from "../../src/store";

describe("ImageViewer.vue", () => {
  it("renders props.msg when passed", () => {
    const wrapper = shallowMount(ImageViewer, {
      propsData: { $store: store }
    });
    expect(wrapper.text()).to.include("Layers");
  });
});
