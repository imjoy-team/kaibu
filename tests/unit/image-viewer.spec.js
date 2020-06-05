import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import ImageViewer from "@/components/ImageViewer.vue";

describe("ImageViewer.vue", () => {
  it("renders props.msg when passed", () => {
    const wrapper = shallowMount(ImageViewer, {
      propsData: {}
    });
    expect(wrapper.text()).to.include("Layers");
  });
});
